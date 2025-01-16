// Создаём директорию с сервисным именем "photo_directory"
export const initDirectories = async (payload) => {
    try {
        // Проверяем, есть ли уже записи
        const existingRecords = await payload.find({
            collection: 'directories',
            where: {
                service_name: { equals: 'photo_directory' },
            },
            depth: 0,
        });
        // Если записи уже существуют, ничего не делаем
        if (existingRecords.docs.length > 0) {
            console.log('Директория уже существует.');
            return;
        }
        // Создаем новую запись, если она отсутствует
        await payload.create({
            collection: 'directories',
            data: {
                service_name: 'photo_directory',
                name: 'Директория папок с фотографиями',
                path: 'undefined',
            },
        });
        console.log('Директория создана.');
    }
    catch (error) {
        console.error('Ошибка при инициализации директории:', error);
    }
};
//# sourceMappingURL=initDirectories.js.map