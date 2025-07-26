
import fs from 'fs';
import path from 'path';
import { getPayload } from 'payload';
import configPromise from '@payload-config'


const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];

const processFolders = async (dir) => {
    const photosDirectory = dir;
    const payload = await getPayload({ config: configPromise })
    // Кеш всех папок из базы
    const allFolders = await payload.find({
        collection: 'folders',
        limit: 1000000,
    });

    const folderCache = [...allFolders.docs]; // локальный кэш из базы
    const foundFolders: { name: string; path: string; fsCreatedAt: number }[] = []; // реальные папки на диске

    const traverseDirectory = async (directory: string) => {
        if (!directory) {
            throw new Error('Путь к директории не задан');
        }
        const items = fs.readdirSync(directory, { withFileTypes: true });


        for (const item of items) {
            if (item.isDirectory()) {
                const currentPath = path.join(directory, item.name);
                const normalizePath = (p: string) => p.split(path.sep).join('/');
                const relativePath = normalizePath(
                    path.relative(photosDirectory, path.dirname(currentPath))
                );

                const stat = fs.statSync(currentPath);
                const fsCreatedAt = stat.birthtimeMs;

                // Сохраняем как "найденную" папку
                foundFolders.push({ name: item.name, path: relativePath, fsCreatedAt: fsCreatedAt, });

                const subItems = fs.readdirSync(currentPath, { withFileTypes: true });

                const hasPhoto = subItems.some(
                    (subItem) =>
                        subItem.isFile() &&
                        imageExtensions.includes(path.extname(subItem.name).toLowerCase())
                );

                try {
                    const existing = folderCache.find(
                        (f) => f.name === item.name && f.path === relativePath
                    );

                    if (existing) {
                        if (existing.with_photo !== hasPhoto ||
                            (existing.fs_created_at as number) !== fsCreatedAt) {
                            await payload.update({
                                collection: 'folders',
                                id: existing.id,
                                data: {
                                    with_photo: hasPhoto,
                                    fs_created_at: fsCreatedAt,
                                },
                            });
                            existing.with_photo = hasPhoto;
                            existing.fs_created_at = fsCreatedAt;
                        }
                    } else {
                        const newFolder = await payload.create({
                            collection: 'folders',
                            data: {
                                name: item.name,
                                path: relativePath,
                                with_photo: hasPhoto,
                                fs_created_at: fsCreatedAt,
                            },
                        });
                        folderCache.push(newFolder);

                    }

                    await traverseDirectory(currentPath);
                } catch (error) {
                    console.error(`Ошибка при обработке папки ${item.name}:`, error);
                }
            }
        }
    };

    await traverseDirectory(photosDirectory);

    // Удаление папок, которых больше нет на диске
    for (const folder of folderCache) {
        const stillExists = foundFolders.some(
            (f) => f.name === folder.name && f.path === folder.path
        );

        if (!stillExists) {
            try {
                await payload.delete({
                    collection: 'folders',
                    id: folder.id,
                });
            } catch (error) {
                console.error(`Ошибка при удалении папки ${folder.name}:`, error);
            }
        }
    }
};

export default processFolders;