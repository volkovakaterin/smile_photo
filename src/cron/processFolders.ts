import fs from 'fs';
import path from 'path';
import payload from 'payload';

const processFolders = async () => {
    const papka = await payload.find({
        collection: 'directories',
        where: {
            service_name: { equals: 'photo_directory' },

        },
    });

    const photosDirectory = `${papka.docs[0].path}/`;


    const traverseDirectory = async (directory) => {
        const items = fs.readdirSync(directory, { withFileTypes: true });

        for (const item of items) {
            if (item.isDirectory()) {
                const currentPath = path.join(directory, item.name);
                const relativePath = path.relative(photosDirectory, path.dirname(currentPath)); // Путь с корневой папкой, исключая саму папку

                try {
                    const existingFolder = await payload.find({
                        collection: 'folders',
                        where: {
                            name: { equals: item.name },
                            path: { equals: relativePath },
                        },
                    });

                    if (existingFolder.docs.length > 0) {
                    } else {
                        await payload.create({
                            collection: 'folders',
                            data: {
                                name: item.name,
                                path: relativePath,
                            },
                        });
                    }

                    await traverseDirectory(currentPath);
                } catch (error) {
                    console.error(`Ошибка при обработке папки ${item.name}:`, error);
                }
            }
        }
    };

    await traverseDirectory(photosDirectory);
};

export default processFolders;
