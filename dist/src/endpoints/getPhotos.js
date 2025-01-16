import path from 'path';
import fs from 'fs';
const getPhotos = {
    path: '/check-images',
    method: 'get',
    handler: async (req) => {
        const { folderPath, photosDirectory, offset = 0, limit = 40 } = req.query;
        if (!folderPath || typeof folderPath !== 'string') {
            return Response.json({ error: 'Путь к папке не указан' }, { status: 400 });
        }
        console.log(folderPath, 'ПУТЬ К ПАПКЕ');
        const folderFullPath = path.join(photosDirectory, folderPath);
        try {
            const files = fs.readdirSync(folderFullPath);
            const images = files
                .filter((file) => ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase()))
                .map((file) => {
                const fullPath = path.join(folderFullPath, file);
                const stats = fs.statSync(fullPath);
                return {
                    file, mtime: stats.mtime
                };
            });
            images.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
            console.log('фАЙЛЫ В ПАПКЕ:', files);
            console.log('ОТФИЛЬТРВАННЫЕ ИЗОБРАЖЕНИЯ:', images);
            const sortedImages = images.map(image => path.join(folderPath, image.file));
            const paginatedImages = sortedImages.slice(Number(offset), Number(offset) + limit);
            const hasNextPage = paginatedImages.length < sortedImages.length;
            if (paginatedImages.length > 0) {
                return Response.json({ hasImages: true, images: paginatedImages, hasNextPage }, { status: 200 });
            }
            else {
                return Response.json({ hasImages: false }, { status: 200 });
            }
        }
        catch (error) {
            console.error('Ошибка при чтении папки:', error);
            return Response.json({ error: 'Не удалось проверить изображения' }, { status: 500 });
        }
    }
};
export default getPhotos;
//# sourceMappingURL=getPhotos.js.map