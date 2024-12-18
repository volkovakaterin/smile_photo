import fs from 'fs';
import path from 'path';
import payload from 'payload';


const validateFoldersInDatabase = async () => {
    console.log('Запуск проверки базы данных...');
    const papka = await payload.find({
        collection: 'directories',
        where: {
            service_name: { equals: 'photo_directory' },

        },
    });

    const photosDirectory = `${papka.docs[0].path}/`;
    try {
        // Получение всех записей из базы данных
        const allFolders = await payload.find({
            collection: 'folders',
            limit: 100000, // Увеличить при большом количестве записей
        });

        for (const folder of allFolders.docs) {
            const folderPath = path.join(photosDirectory, folder.path || '', folder.name);

            // Проверка существования папки в файловой системе
            if (!fs.existsSync(folderPath)) {
                try {
                    // Удаление записи из базы данных, если папка отсутствует
                    await payload.delete({
                        collection: 'folders',
                        id: folder.id,
                    });
                    console.log(`Папка ${folder.name} удалена из базы данных (отсутствует в директории).`);
                } catch (error) {
                    console.error(`Ошибка при удалении папки ${folder.name} из базы данных:`, error);
                }
            } else {
                console.log(`Папка ${folder.name} присутствует в директории.`);
            }
        }

        console.log('Проверка базы данных завершена.');
    } catch (error) {
        console.error('Ошибка при получении данных из базы:', error);
    }
};

export default validateFoldersInDatabase;

