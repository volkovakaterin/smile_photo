

import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path: imagePath } = req.query;

    if (!imagePath) {
        res.status(400).send('Image path is required');
        return;
    }

    // Декодирование пути из параметров
    const decodedPath = decodeURIComponent(Array.isArray(imagePath) ? imagePath.join('/') : imagePath);
    let normalizedPath = path.normalize(decodedPath);

    const isAbsolute = path.isAbsolute(normalizedPath);

    console.log('Requested path:', decodedPath);

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