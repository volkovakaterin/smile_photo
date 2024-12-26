// Создаём директорию с сервисным именем "photo_directory"

export const initDirectories = async (payload) => {
    const existingRecords = await payload.find({
        collection: 'directories',
        depth: 0,
    });

    if (existingRecords.docs.length === 0) {

        await payload.create({
            collection: 'directories',
            data: {
                service_name: 'photo_directory',
                name: 'Директория папок с фотографиями',
                path: '/',
            },
        });

    }
};