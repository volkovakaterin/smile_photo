import fs from 'fs';
import path from 'path';
import payload from 'payload';


const validateFoldersInDatabase = async () => {
    const papka = await payload.find({
        collection: 'directories',
        where: {
            service_name: { equals: 'photo_directory' },

        },
    });

    const photosDirectory = `${papka.docs[0].path}/`;
    try {
        const allFolders = await payload.find({
            collection: 'folders',
            limit: 100000,
        });

        for (const folder of allFolders.docs) {
            const folderPath = path.join(photosDirectory, folder.path || '', folder.name);

            if (!fs.existsSync(folderPath)) {
                try {
                    await payload.delete({
                        collection: 'folders',
                        id: folder.id,
                    });
                } catch (error) {
                    console.error(`Ошибка при удалении папки ${folder.name} из базы данных:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Ошибка при получении данных из базы:', error);
    }
};

export default validateFoldersInDatabase;

