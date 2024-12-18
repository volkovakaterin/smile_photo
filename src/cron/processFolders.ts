import fs from 'fs';
import path from 'path';
import payload from 'payload';

const processFolders = async () => {
    console.log('Запуск процесса обработки папок...');
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

                console.log(`Обнаружена папка: ${item.name}`);
                try {
                    // Проверяем наличие записи в базе для текущей папки
                    const existingFolder = await payload.find({
                        collection: 'folders',
                        where: {
                            name: { equals: item.name },
                            path: { equals: relativePath },
                        },
                    });

                    if (existingFolder.docs.length > 0) {
                        console.log(`Папка ${item.name} уже существует в базе.`);
                    } else {
                        // Добавляем текущую папку в базу
                        await payload.create({
                            collection: 'folders',
                            data: {
                                name: item.name, // Название папки
                                path: relativePath, // Полный путь с корнем
                            },
                        });
                        console.log(`Папка ${item.name} успешно добавлена в базу.`);
                    }

                    // Рекурсивно обрабатываем подкаталоги
                    await traverseDirectory(currentPath);
                } catch (error) {
                    console.error(`Ошибка при обработке папки ${item.name}:`, error);
                }
            }
        }
    };

    await traverseDirectory(photosDirectory);
    console.log('Процесс обработки папок завершён.');
};

export default processFolders;
