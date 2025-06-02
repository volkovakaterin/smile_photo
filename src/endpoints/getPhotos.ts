import { Endpoint } from "payload";
import fs from 'fs';
import path from 'path';
import payload from 'payload';

const getPhotos: Endpoint = {
    path: '/check-images',
    method: 'get',
    handler: async (req) => {
        const { folderPath, photosDirectory, offset = 0, limit = 20 } = req.query as {
            folderPath: string,
            photosDirectory: string,
            offset: number | string,
            limit: number | string
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
                .map((file) => {
                    const fullPath = path.join(folderFullPath, file);
                    const stats = fs.statSync(fullPath);
                    return {
                        file,
                        mtime: stats.mtime
                    };
                });

            images.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
            const sortedImages = images.map(image => path.join(folderPath, image.file));
            const paginatedImages = sortedImages.slice(Number(offset), Number(offset) + Number(limit));
            const hasNextPage = paginatedImages.length < sortedImages.length;


            const paginatedImagesNormPath = paginatedImages.map((img) => {
                return `${photosDirectory}/${decodeURIComponent(img)}`;
            });

            if (paginatedImages.length > 0) {
                return Response.json({ hasImages: true, images: paginatedImagesNormPath, hasNextPage }, { status: 200 });
            } else {
                return Response.json({ hasImages: false }, { status: 200 });
            }
        } catch (error) {
            console.error('Ошибка при чтении папки:', error);
            return Response.json({ error: 'Не удалось проверить изображения' }, { status: 500 });
        }
    }
};

export default getPhotos;

