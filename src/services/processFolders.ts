import fs from 'fs';
import path from 'path';
import type { Payload } from 'payload';

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];

type Options = { scope: 'all' | 'today' };

function normalizePath(p: string) {
    return p.split(path.sep).join('/');
}

function hasPhotoInDir(dirPath: string) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.some(
        (it) => it.isFile() && imageExtensions.includes(path.extname(it.name).toLowerCase()),
    );
}

function getTodayRangeMs() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { startMs: start.getTime(), endMs: end.getTime() };
}

function getTodayFolderName() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${dd}-${mm}-${yyyy}`; // строго DD-MM-YYYY
}


async function loadAllFolders(payload: any) {
    const docs: any[] = [];
    let page = 1;

    while (true) {
        const res = await payload.find({
            collection: 'folders',
            page,
            limit: 500,
            depth: 0,
        });

        docs.push(...res.docs);
        if (page >= res.totalPages) break;
        page++;
    }

    return docs;
}

async function findByFullPath(payload: any, fullPath: string) {
    const res = await payload.find({
        collection: 'folders',
        where: { fullPath: { equals: fullPath } },
        limit: 1,
        depth: 0,
    });
    return res.docs?.[0] ?? null;
}

async function upsertFolderSafe(payload: any, cacheByFullPath: Map<string, any>, data: any) {
    const cached = cacheByFullPath.get(data.fullPath);

    if (cached) {
        const needUpdate =
            Boolean(cached.with_photo) !== data.with_photo ||
            Number(cached.fs_created_at ?? 0) !== Number(data.fs_created_at) ||
            (cached.name ?? '') !== data.name ||
            (cached.path ?? '') !== data.path;

        if (!needUpdate) return;

        await payload.update({
            collection: 'folders',
            id: cached.id,
            data: {
                name: data.name,
                path: data.path,
                with_photo: data.with_photo,
                fs_created_at: data.fs_created_at,
            },
            overrideAccess: true,
        });

        cacheByFullPath.set(data.fullPath, { ...cached, ...data });
        return;
    }

    try {
        const created = await payload.create({
            collection: 'folders',
            data: {
                fullPath: data.fullPath,
                name: data.name,
                path: data.path,
                with_photo: data.with_photo,
                fs_created_at: data.fs_created_at,
            },
            overrideAccess: true,
        });
        cacheByFullPath.set(data.fullPath, created);
    } catch (err: any) {
        console.error('upsertFolderSafe: create failed', {
            fullPath: data?.fullPath,
            name: data?.name,
            path: data?.path,
            with_photo: data?.with_photo,
            fs_created_at: data?.fs_created_at,
            errMessage: err?.message,
            status: err?.status,
            payloadErrors: err?.data?.errors,
        });
        const msg = String(err?.message ?? err).toLowerCase();

        // 1) классический дубль Mongo
        const looksLikeMongoDuplicate =
            msg.includes('duplicate') || msg.includes('unique') || msg.includes('e11000');

        // 2) дубль через Payload validation ("Value must be unique")
        const payloadErrors: any[] = Array.isArray(err?.data?.errors) ? err.data.errors : [];
        const looksLikePayloadUnique =
            payloadErrors.some((e) => e?.path === 'fullPath' && String(e?.message ?? '').toLowerCase().includes('unique'));

        if (!looksLikeMongoDuplicate && !looksLikePayloadUnique) {
            throw err;
        }

        const existing = await findByFullPath(payload, data.fullPath);
        if (!existing) throw err;

        await payload.update({
            collection: 'folders',
            id: existing.id,
            data: {
                name: data.name,
                path: data.path,
                with_photo: data.with_photo,
                fs_created_at: data.fs_created_at,
            },
            overrideAccess: true,
        });

        cacheByFullPath.set(data.fullPath, { ...existing, ...data });
    }
}

/**
 * Загрузка всех документов конкретной ветки: root + root/*
 */
async function loadBranchDocs(payload: any, rootFullPath: string) {
    const docs: any[] = [];
    let page = 1;

    while (true) {
        const res = await payload.find({
            collection: 'folders',
            page,
            limit: 500,
            depth: 0,
            where: {
                or: [
                    { fullPath: { equals: rootFullPath } },
                    { fullPath: { like: `${rootFullPath}/%` } },
                ],
            },
        });

        docs.push(...res.docs);
        if (page >= res.totalPages) break;
        page++;
    }

    return docs;
}


export default async function processFolders(payload: Payload, dir: string, options: Options = { scope: 'all' }) {
    if (!dir) throw new Error('Путь к директории не задан');

    const photosDirectory = dir;

    const foundFullPaths = new Set<string>();
    let scannedDirs = 0;
    let upsertedDirs = 0;
    let deletedMissing = 0;

    /**
     * cacheByFullPath нужен для upsert-ов, чтобы не ходить find() на каждый апдейт.
     * - для all: грузим всю БД
     * - для today: грузим только ветки today (после определения todayRootDirs)
     */
    let cacheByFullPath = new Map<string, any>();

    const traverseRecursive = async (directoryAbs: string) => {
        const items = fs.readdirSync(directoryAbs, { withFileTypes: true });

        for (const item of items) {
            if (!item.isDirectory()) continue;

            const currentAbs = path.join(directoryAbs, item.name);

            // fullPath = относительный путь папки от photosDirectory
            const fullPath = normalizePath(path.relative(photosDirectory, currentAbs));

            const stat = fs.statSync(currentAbs);
            const fsCreatedAt = stat.birthtimeMs;

            const parent = normalizePath(path.dirname(fullPath));
            const parentPath = parent === '.' ? '' : parent;

            const withPhoto = hasPhotoInDir(currentAbs);

            scannedDirs++;
            foundFullPaths.add(fullPath);

            await upsertFolderSafe(payload, cacheByFullPath, {
                fullPath,
                name: item.name,
                path: parentPath,
                with_photo: withPhoto,
                fs_created_at: fsCreatedAt,
            });

            upsertedDirs++;

            await traverseRecursive(currentAbs);
        }
    };

    // ========== scope: all ==========
    if (options.scope === 'all') {
        const dbFolders = await loadAllFolders(payload);
        cacheByFullPath = new Map<string, any>();
        for (const f of dbFolders) {
            // fullPath обязателен, но на всякий случай оставим фолбек
            const key =
                f.fullPath ??
                normalizePath(path.posix.join(f.path ?? '', f.name ?? '')).replace(/^\/+/, '');
            cacheByFullPath.set(key, f);
        }

        await traverseRecursive(photosDirectory);

        // Удаление отсутствующих — только в режиме all
        for (const [fullPath, folder] of cacheByFullPath.entries()) {
            if (!foundFullPaths.has(fullPath)) {
                try {
                    await payload.delete({
                        collection: 'folders',
                        id: folder.id,
                        overrideAccess: true,
                    });
                    deletedMissing++;
                } catch (e) {
                    console.error(`Ошибка при удалении fullPath=${fullPath}:`, e);
                }
            }
        }

        return {
            scope: 'all',
            scannedDirs,
            upsertedDirs,
            deletedMissing,
        };
    }

    // ========== scope: today (production fast) ==========

    function getTodayFolderName() {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = String(d.getFullYear());
        return `${dd}-${mm}-${yyyy}`; // DD-MM-YYYY
    }

    function isTodayFolder(folderName: string, birthMs: number, startMs: number, endMs: number, todayName: string) {
        return (birthMs >= startMs && birthMs < endMs) || folderName === todayName;
    }

    type TodayRoot = {
        abs: string;
        fullPath: string; // relative from photosDirectory
        name: string;
        path: string;     // parent relative path ('' or 'a' for 'a/b')
        birthMs: number;
    };

    /**
     * Оставляем только "верхние" корни: если есть A, то A/B выкидываем.
     */
    function filterNestedRoots(roots: TodayRoot[]) {
        // сортируем короткие пути раньше длинных
        const sorted = [...roots].sort((a, b) => a.fullPath.length - b.fullPath.length);

        const kept: TodayRoot[] = [];
        const keptSet = new Set<string>();

        for (const r of sorted) {
            // проверяем, что никакой уже оставленный корень не является префиксом r.fullPath + "/"
            let isNested = false;
            // быстрый чек по родителям (обычно 1-2 итерации)
            const parts = r.fullPath.split('/');
            while (parts.length > 1) {
                parts.pop();
                const parent = parts.join('/');
                if (keptSet.has(parent)) {
                    isNested = true;
                    break;
                }
            }
            if (!isNested) {
                kept.push(r);
                keptSet.add(r.fullPath);
            }
        }

        return kept;
    }

    /**
     * Грузим документы для всех веток одним (или несколькими) запросами:
     * OR: [equals root, like root/%, equals root2, like root2/% ...]
     * Чанкуем условия, чтобы не упереться в лимиты запроса.
     */
    async function loadDocsForRoots(payload: any, rootFullPaths: string[]) {
        const docs: any[] = [];
        if (rootFullPaths.length === 0) return docs;

        const makeConditions = (roots: string[]) =>
            roots.flatMap((root) => [
                { fullPath: { equals: root } },
                { fullPath: { like: `${root}/%` } },
            ]);

        // 100 roots => 200 OR условий. Можно менять под ваш Payload/Mongo лимит.
        const ROOTS_PER_CHUNK = 80;

        for (let i = 0; i < rootFullPaths.length; i += ROOTS_PER_CHUNK) {
            const chunk = rootFullPaths.slice(i, i + ROOTS_PER_CHUNK);
            const whereOr = makeConditions(chunk);

            let page = 1;
            while (true) {
                const res = await payload.find({
                    collection: 'folders',
                    page,
                    limit: 500,
                    depth: 0,
                    where: { or: whereOr },
                });

                docs.push(...res.docs);
                if (page >= res.totalPages) break;
                page++;
            }
        }

        return docs;
    }

    const { startMs, endMs } = getTodayRangeMs();
    const todayName = getTodayFolderName();

    // 1) Ищем today-папки на 1-2 уровнях (глубже не идём)
    const todayCandidates: TodayRoot[] = [];

    const rootItems = fs.readdirSync(photosDirectory, { withFileTypes: true });

    for (const it of rootItems) {
        if (!it.isDirectory()) continue;

        const abs1 = path.join(photosDirectory, it.name);
        const stat1 = fs.statSync(abs1);
        const birth1 = stat1.birthtimeMs;

        const fullPath1 = normalizePath(path.relative(photosDirectory, abs1)); // it.name
        if (isTodayFolder(it.name, birth1, startMs, endMs, todayName)) {
            todayCandidates.push({
                abs: abs1,
                fullPath: fullPath1,
                name: it.name,
                path: '',
                birthMs: birth1,
            });
        }

        // уровень 2
        let level2Items: fs.Dirent[] = [];
        try {
            level2Items = fs.readdirSync(abs1, { withFileTypes: true });
        } catch {
            // если нет доступа/ошибка чтения — пропускаем подпапки
            continue;
        }

        for (const sub of level2Items) {
            if (!sub.isDirectory()) continue;

            const abs2 = path.join(abs1, sub.name);
            const stat2 = fs.statSync(abs2);
            const birth2 = stat2.birthtimeMs;

            if (!isTodayFolder(sub.name, birth2, startMs, endMs, todayName)) continue;

            const fullPath2 = normalizePath(path.relative(photosDirectory, abs2)); // `${it.name}/${sub.name}`
            const parentDir = normalizePath(path.dirname(fullPath2));
            const parentPath2 = parentDir === '.' ? '' : parentDir;

            todayCandidates.push({
                abs: abs2,
                fullPath: fullPath2,
                name: sub.name,
                path: parentPath2,
                birthMs: birth2,
            });
        }
    }

    // Нормализация: убираем дубликаты и вложенные корни
    const uniqMap = new Map<string, TodayRoot>();
    for (const r of todayCandidates) {
        // если одинаковый fullPath попался дважды — берём более "новый" birthMs (не принципиально)
        const prev = uniqMap.get(r.fullPath);
        if (!prev || r.birthMs > prev.birthMs) uniqMap.set(r.fullPath, r);
    }
    let todayRootDirs = filterNestedRoots(Array.from(uniqMap.values()));

    if (todayRootDirs.length === 0) {
        return {
            scope: 'today',
            todayRootDirs: [],
            scannedDirs: 0,
            upsertedDirs: 0,
            deletedMissing: 0,
        };
    }

    // 2) Один раз грузим ВСЕ документы БД, которые относятся к этим веткам
    const rootFullPaths = todayRootDirs.map((x) => x.fullPath);
    const existingBranchDocs = await loadDocsForRoots(payload, rootFullPaths);

    // cacheByFullPath для upsert без find на каждый апдейт
    cacheByFullPath = new Map<string, any>();
    for (const doc of existingBranchDocs) {
        if (doc?.fullPath) cacheByFullPath.set(doc.fullPath, doc);
    }

    // 3) Апсертим корни и рекурсивно обходим только их (без повторных обходов)
    for (const d of todayRootDirs) {
        const withPhoto = hasPhotoInDir(d.abs);

        scannedDirs++;
        foundFullPaths.add(d.fullPath);

        await upsertFolderSafe(payload, cacheByFullPath, {
            fullPath: d.fullPath,
            name: d.name,
            path: d.path,
            with_photo: withPhoto,
            fs_created_at: d.birthMs,
        });

        upsertedDirs++;

        await traverseRecursive(d.abs);
    }

    // 4) Удаляем отсутствующие ТОЛЬКО среди уже загруженных документов веток
    //    (без повторного loadBranchDocs())
    for (const doc of existingBranchDocs) {
        const fp = doc?.fullPath;
        if (!fp) continue;

        if (!foundFullPaths.has(fp)) {
            try {
                await payload.delete({
                    collection: 'folders',
                    id: doc.id,
                    overrideAccess: true,
                });
                deletedMissing++;
            } catch (e) {
                console.error(`Ошибка при удалении (today) fullPath=${fp}:`, e);
            }
        }
    }

    return {
        scope: 'today',
        todayRootDirs: rootFullPaths,
        scannedDirs,
        upsertedDirs,
        deletedMissing,
    };


}
