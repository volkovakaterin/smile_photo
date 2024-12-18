import fs from 'fs';
import path from 'path';
import payload from 'payload';
const photosDirectory = path.join(__dirname, '../local/photos'); // Укажите путь к папке с фотографиями
const processPhotos = async () => {
    console.log('Запуск процесса обработки фотографий...');
    const files = fs.readdirSync(photosDirectory);
    for (const file of files) {
        const filePath = path.join(photosDirectory, file);
        // Проверьте, что это файл и имеет нужное расширение
        if (fs.lstatSync(filePath).isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file)) {
            console.log(`Обработка файла: ${file}`);
            // Добавьте информацию о фото в коллекцию Payload
            await payload.create({
                collection: 'photos', // Укажите имя вашей коллекции
                data: {
                    title: file, // Название файла
                    location: file,
                    path: '',
                    price: 100,
                    datetime: Date(),
                    description: 'Описание фото', // Можно добавить дополнительные данные
                },
            });
            console.log(`Файл ${file} успешно добавлен в базу.`);
        }
    }
};
export default processPhotos;
//# sourceMappingURL=processPhotos.js.map