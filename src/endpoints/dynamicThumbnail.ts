import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';
import { Endpoint, PayloadRequest } from 'payload';

function makeEtag(size: number, versionMs: number, w: number, h: number) {
    const s = `${size}:${versionMs}:${w}x${h}`;
    return `"${crypto.createHash('sha1').update(s).digest('hex')}"`;
}

function getHeader(req: PayloadRequest, name: string): string | null {
    const h1 = (req as any)?.headers?.get?.(name);
    if (typeof h1 === 'string') return h1;
    const h2 = (req as any)?.headers?.[name.toLowerCase()];
    if (typeof h2 === 'string') return h2;
    return null;
}

const dynamicThumbnail: Endpoint = {
    path: '/dynamic-thumbnail',
    method: 'get',
    handler: async (req: PayloadRequest) => {
        if (req.method !== 'GET') {
            return new Response(JSON.stringify({ error: 'Метод не разрешен' }), { status: 405 });
        }

        const { img, width, height, v, ver, reval, check } = req.query as {
            img?: string;
            width?: string;
            height?: string;
            v?: string;      // форс-обновление
            ver?: string;    // версия контента (mtimeMs), если передали
            reval?: string;  // принудительная ревалидация
            check?: string;  // режим проверки без генерации
            bv?: string;     // можно передавать, но серверу не нужен
        };

        if (!img || typeof img !== 'string') {
            return new Response(JSON.stringify({ error: 'Не указан путь к изображению' }), { status: 400 });
        }

        const imagePath = decodeURIComponent(img);

        if (!fs.existsSync(imagePath)) {
            return new Response(JSON.stringify({ error: 'Изображение не найдено' }), { status: 404 });
        }

        const thumbnailWidth = width ? parseInt(width, 10) : 200;
        const thumbnailHeight = height ? parseInt(height, 10) : 200;

        try {
            const stat = fs.statSync(imagePath);

            const isForced = Boolean(v);
            const forceRevalidate = reval === '1';
            const isCheckOnly = check === '1';

            const verNum = typeof ver === 'string' ? Number(ver) : NaN;
            const verIsValid = Number.isFinite(verNum) && verNum > 0;

            // immutable разрешаем только если ver совпадает с реальным mtimeMs
            const canBeImmutable = verIsValid && verNum === stat.mtimeMs;

            // ETag всегда по реальному файлу
            const etag = makeEtag(stat.size, stat.mtimeMs, thumbnailWidth, thumbnailHeight);

            const inm = getHeader(req, 'if-none-match');

            // ✅ Режим CHECK: только проверка, никаких sharp
            if (isCheckOnly) {
                const isNotModified = inm === etag;
                return new Response(null, {
                    status: isNotModified ? 304 : 200,
                    headers: {
                        ETag: etag,
                        'Last-Modified': new Date(stat.mtimeMs).toUTCString(),
                        'Cache-Control': 'no-store', // проверку не кэшируем
                    },
                });
            }

            // ✅ 304 до генерации
            if (!isForced && inm === etag) {
                return new Response(null, {
                    status: 304,
                    headers: {
                        ETag: etag,
                        'Last-Modified': new Date(stat.mtimeMs).toUTCString(),
                        'Cache-Control': canBeImmutable && !forceRevalidate
                            ? 'public, max-age=31536000, immutable'
                            : 'public, no-cache',
                    },
                });
            }

            // ✅ Генерация
            const buffer = await sharp(imagePath)
                .rotate()
                .resize(thumbnailWidth, thumbnailHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            const cacheControl = isForced
                ? 'no-store'
                : canBeImmutable && !forceRevalidate
                    ? 'public, max-age=31536000, immutable'
                    : 'public, no-cache';

            return new Response(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'image/jpeg',
                    ETag: etag,
                    'Last-Modified': new Date(stat.mtimeMs).toUTCString(),
                    'Cache-Control': cacheControl,
                },
            });
        } catch (error) {
            console.error('Ошибка при генерации миниатюры:', error);
            return new Response(JSON.stringify({ error: 'Ошибка при генерации миниатюры' }), { status: 500 });
        }
    },
};

export default dynamicThumbnail;
