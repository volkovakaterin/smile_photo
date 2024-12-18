export const initDirectories = async (payload) => {
    // Проверяем наличие записей в коллекции 'directories'
    const existingRecords = await payload.find({
        collection: 'directories',
        depth: 0,
    });

    if (existingRecords.docs.length === 0) {
        // Создаём директорию с сервисным именем "photo_directory"
        await payload.create({
            collection: 'directories',
            data: {
                service_name: 'photo_directory',
                name: 'Директория папок с фотографиями',
                path: '/',
            },
        });
        console.log('Default directory created.');
    }
};