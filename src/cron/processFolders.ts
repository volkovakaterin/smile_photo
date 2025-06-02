
import fs from 'fs';
import path from 'path';
import payload from 'payload';

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'];

const processFolders = async () => {
    const papka = await payload.find({
        collection: 'directories',
        where: {
            service_name: { equals: 'photo_directory' },
        },
    });

    if (!papka.docs.length) {
        throw new Error('Не найдена директория с service_name: photo_directory');
    }

    const photosDirectory = `${papka.docs[0].path}/`;

    // Кеш всех папок из базы
    const allFolders = await payload.find({
        collection: 'folders',
        limit: 1000000,
    });

    const folderCache = [...allFolders.docs]; // локальный кэш из базы
    const foundFolders: { name: string; path: string }[] = []; // реальные папки на диске

    const traverseDirectory = async (directory: string) => {
        const items = fs.readdirSync(directory, { withFileTypes: true });

        for (const item of items) {
            if (item.isDirectory()) {
                const currentPath = path.join(directory, item.name);
                const normalizePath = (p: string) => p.split(path.sep).join('/');
                const relativePath = normalizePath(
                    path.relative(photosDirectory, path.dirname(currentPath))
                );

                // Сохраняем как "найденную" папку
                foundFolders.push({ name: item.name, path: relativePath });

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
                        if (existing.with_photo !== hasPhoto) {
                            await payload.update({
                                collection: 'folders',
                                id: existing.id,
                                data: {
                                    with_photo: hasPhoto,
                                },
                            });
                            existing.with_photo = hasPhoto;
                        }
                    } else {
                        const newFolder = await payload.create({
                            collection: 'folders',
                            data: {
                                name: item.name,
                                path: relativePath,
                                with_photo: hasPhoto,
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


