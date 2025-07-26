import fs from 'fs';
import sharp from 'sharp';
import { Endpoint, PayloadRequest } from 'payload';

const dynamicThumbnail: Endpoint = {
    path: '/dynamic-thumbnail',
    method: 'get',
    handler: async (req: PayloadRequest) => {

        // Разрешаем только GET-запросы
        if (req.method !== 'GET') {
            return new Response(JSON.stringify({ error: 'Метод не разрешен' }), { status: 405 });
        }


        // Извлекаем параметры запроса
        const { img, width, height } = req.query as {
            img?: string;
            width?: string;
            height?: string;
        };
        if (!img || typeof img !== 'string') {
            return new Response(JSON.stringify({ error: 'Не указан путь к изображению' }), { status: 400 });
        }

        const imagePath = img;

        if (!fs.existsSync(imagePath)) {
            return new Response(JSON.stringify({ error: 'Изображение не найдено' }), { status: 404 });
        }
        const thumbnailWidth = width ? parseInt(width, 10) : 300;
        const thumbnailHeight = height ? parseInt(height, 10) : 300;

        try {
            // Генерируем миниатюру как буфер
            const buffer = await sharp(imagePath)
                .rotate()
                .resize(thumbnailWidth, thumbnailHeight, {
                    fit: 'inside',            // масштабирование с сохранением пропорций, без обрезки
                    withoutEnlargement: true,   // не увеличивать, если изображение меньше заданного размера
                })
                .jpeg({ quality: 80 })        // сжатие с качеством 80%
                .toBuffer();

            return new Response(buffer, {
                headers: {
                    'Content-Type': 'image/jpeg',
                },
                status: 200,
            });
        } catch (error) {
            console.error('Ошибка при генерации миниатюры:', error);
            return new Response(JSON.stringify({ error: 'Ошибка при генерации миниатюры' }), { status: 500 });
        }
    },
};

export default dynamicThumbnail;
