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
async function loadBranchDocs(payload: any, rootName: string) {
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
                    { fullPath: { equals: rootName } },
                    { fullPath: { like: `${rootName}/%` } },
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

    // ========== scope: today ==========
    const { startMs, endMs } = getTodayRangeMs();

    // 1) Находим ВСЕ корневые папки, созданные сегодня (может быть несколько)
    const rootItems = fs.readdirSync(photosDirectory, { withFileTypes: true });
    const todayRootDirs: { abs: string; name: string; birthMs: number }[] = [];

    for (const it of rootItems) {
        if (!it.isDirectory()) continue;

        const abs = path.join(photosDirectory, it.name);
        const stat = fs.statSync(abs);
        const birthMs = stat.birthtimeMs;

        if (birthMs >= startMs && birthMs < endMs) {
            todayRootDirs.push({ abs, name: it.name, birthMs });
        }
    }

    // Если сегодня вообще нет новых корневых папок — ничего не делаем
    if (todayRootDirs.length === 0) {
        return {
            scope: 'today',
            todayRootDirs: [],
            scannedDirs: 0,
            upsertedDirs: 0,
            deletedMissing: 0,
        };
    }

    // 2) Загружаем из БД ТОЛЬКО документы сегодняшних веток (для ускорения today)
    cacheByFullPath = new Map<string, any>();

    for (const root of todayRootDirs) {
        const branchDocs = await loadBranchDocs(payload, root.name);
        for (const doc of branchDocs) {
            if (doc?.fullPath) cacheByFullPath.set(doc.fullPath, doc);
        }
    }

    // 3) Апсертим корневые папки today и рекурсивно обходим ТОЛЬКО их
    for (const d of todayRootDirs) {
        // upsert самой корневой папки дня
        const fullPath = normalizePath(path.relative(photosDirectory, d.abs)); // = d.name
        const parentPath = '';
        const withPhoto = hasPhotoInDir(d.abs);

        scannedDirs++;
        foundFullPaths.add(fullPath);

        await upsertFolderSafe(payload, cacheByFullPath, {
            fullPath,
            name: d.name,
            path: parentPath,
            with_photo: withPhoto,
            fs_created_at: d.birthMs,
        });

        upsertedDirs++;

        // затем вглубь только в эту папку
        await traverseRecursive(d.abs);
    }

    // 4) Удаляем из БД отсутствующие папки ТОЛЬКО внутри сегодняшних веток
    //    (важно: не трогаем другие дни)
    const todayRootNames = todayRootDirs.map((x) => x.name);

    for (const rootName of todayRootNames) {
        const branchDocs = await loadBranchDocs(payload, rootName);

        for (const doc of branchDocs) {
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
    }

    return {
        scope: 'today',
        todayRootDirs: todayRootNames,
        scannedDirs,
        upsertedDirs,
        deletedMissing,
    };
}
