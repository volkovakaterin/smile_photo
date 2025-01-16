import path from 'path';
import fs from 'fs';
export default async function handler(req, res) {
    const { path: imagePath } = req.query;
    console.log(imagePath, 'IMAGE PATCH');
    if (!imagePath) {
        res.status(400).send('Image path is required');
        return;
    }
    // Декодирование пути из параметров
    const decodedPath = decodeURIComponent(Array.isArray(imagePath) ? imagePath.join('/') : imagePath);
    let normalizedPath = path.normalize(decodedPath);
    const isAbsolute = path.isAbsolute(normalizedPath);
    console.log('Is absolute path:', isAbsolute);
    console.log('Requested path:', decodedPath);
    console.log('Resolved file path:', normalizedPath);
    if (!isAbsolute) {
        normalizedPath = path.join('/', normalizedPath);
        console.log('Updated path (with leading slash):', normalizedPath);
    }
    // Проверяем существование файла
    if (!fs.existsSync(normalizedPath)) {
        res.status(404).send('Image not found');
        return;
    }
    // Устанавливаем тип содержимого и отправляем файл
    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(normalizedPath).pipe(res);
}
//# sourceMappingURL=%5B...path%5D.js.map