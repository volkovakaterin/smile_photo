import { Endpoint } from "payload";
import path from 'path';
import fs from 'fs';

const getPhotos: Endpoint = {
    path: '/check-images',
    method: 'get',
    handler: async (req) => {
        console.log(req.query)
        const { folderPath, photosDirectory, offset = 0, limit = 40 } = req.query as { folderPath: string, photosDirectory: string, offset, limit };
        console.log('есть запрос')



        if (!folderPath || typeof folderPath !== 'string') {
            return Response.json({ error: 'Путь к папке не указан' }, { status: 400 })
        }

        const folderFullPath = path.join(photosDirectory, folderPath as string);

        try {
            const files = fs.readdirSync(folderFullPath);
            console.log(folderFullPath, 'путь тут нужен')

            // Получаем информацию о каждом файле, включая дату изменения
            const images = files
                .filter((file) =>
                    ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())
                )
                .map((file) => {
                    const fullPath = path.join(folderFullPath, file);
                    const stats = fs.statSync(fullPath); // Получаем информацию о файле
                    return {
                        file, mtime: stats.mtime
                    }; // mtime - время последней модификации
                });

            // Сортируем изображения по времени модификации (от новых к старым)
            images.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

            // Генерируем массив путей после сортировки
            const sortedImages = images.map(image => path.join(folderPath, image.file));
            console.log(Number(offset) + limit, 'offset + limit', Number(offset), limit)
            const paginatedImages = sortedImages.slice(Number(offset), Number(offset) + limit);
            console.log(paginatedImages.length, 'ДЛИНА ПАГИНИРОВАНЫЙ КАРТИНОК')
            // Проверяем, есть ли еще изображения для следующей страницы
            const hasNextPage = paginatedImages.length < sortedImages.length;
            if (paginatedImages.length > 0) {
                // console.log(paginatedImages)
                return Response.json({ hasImages: true, images: paginatedImages, hasNextPage }, { status: 200 })

            } else {
                return Response.json({ hasImages: false }, { status: 200 })
            }
        } catch (error) {
            console.error('Ошибка при чтении папки:', error);
            return Response.json({ error: 'Не удалось проверить изображения' }, { status: 500 })
        }
    }
}

export default getPhotos;

