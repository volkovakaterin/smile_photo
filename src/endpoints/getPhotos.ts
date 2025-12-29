import { Endpoint } from "payload";
import fs from 'fs';
import path from 'path';

const getPhotos: Endpoint = {
    path: '/check-images',
    method: 'get',
    handler: async (req) => {
        const { folderPath, photosDirectory, offset = 0, limit } = req.query as {
            folderPath: string,
            photosDirectory: string,
            offset: number | string,
            limit?: number | string
        };

        if (!folderPath || typeof folderPath !== 'string') {
            return Response.json({ error: 'Путь к папке не указан' }, { status: 400 });
        }

        const folderFullPath = path.join(photosDirectory, folderPath);

        try {
            const files = fs.readdirSync(folderFullPath);

            const images = files
                .filter((file) =>
                    ['.jpg', '.jpeg'].includes(path.extname(file).toLowerCase())
                )
                .sort((a, b) => {
                    const A = path.parse(a).name;
                    const B = path.parse(b).name;

                    const ma = A.match(/^([A-Za-z]+)[_-](\d+)/);
                    const mb = B.match(/^([A-Za-z]+)[_-](\d+)/);

                    // если формат не совпал — fallback на обычную сортировку
                    if (!ma || !mb) return A.localeCompare(B, undefined, { numeric: true, sensitivity: 'base' });

                    const prefixA = ma[1].toUpperCase();
                    const prefixB = mb[1].toUpperCase();

                    if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);

                    const numA = parseInt(ma[2], 10);
                    const numB = parseInt(mb[2], 10);

                    if (numA !== numB) return numA - numB;

                    // если числа равны (редко), сравним полное имя, чтобы было стабильно
                    return A.localeCompare(B, undefined, { numeric: true, sensitivity: 'base' });
                })
                .map((file) => {
                    const fullPath = path.join(folderFullPath, file);
                    return file;
                });

            const sortedImages = images;

            let paginatedImages: string[];
            let hasNextPage = false; // по умолчанию нет следующей страницы

            const imagesPaths = sortedImages.map(image => path.join(folderPath, image));

            if (limit !== undefined) {
                // Когда limit есть — делаем срез
                const offNum = Number(offset);
                const limNum = Number(limit);

                paginatedImages = imagesPaths.slice(offNum, offNum + limNum);
                // hasNextPage = true, если обрезали не до конца
                hasNextPage = offNum + limNum < imagesPaths.length;
            } else {
                // Когда limit не пришёл — отдаём всё
                paginatedImages = imagesPaths;
                hasNextPage = false;
            }

            // Преобразуем каждый путь в абсолютный, добавляя photosDirectory
            const paginatedImagesNormPath = paginatedImages.map((img) => {
                return `${photosDirectory}/${decodeURIComponent(img)}`;
            });

            if (paginatedImages.length > 0) {
                return Response.json(
                    {
                        hasImages: true,
                        images: paginatedImagesNormPath,
                        hasNextPage,
                    },
                    { status: 200 }
                );
            } else {
                // Пустой результат (если в этом диапазоне нет картинок)
                return Response.json({ hasImages: false }, { status: 200 });
            }
        } catch (error) {
            console.error('Ошибка при чтении папки:', error);
            return Response.json({ error: 'Не удалось проверить изображения' }, { status: 500 });
        }
    }
};

export default getPhotos;