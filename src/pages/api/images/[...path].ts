import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import payload from 'payload';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path: imagePath } = req.query;
    // console.log(req.query, 'ЧТО В ЗАПРОСЕ')

    if (!imagePath) {
        res.status(400).send('Image path is required');
        return;
    }

    // Локальная директория с изображениями
    const imagesDir = path.join('/Users/ekaterinavolkova/Desktop/WorkTable/chili_folders');

    // const filePath = path.join(imagesDir, ...(Array.isArray(imagePath) ? imagePath : [imagePath]));
    const filePath = path.join('/', ...(Array.isArray(imagePath) ? imagePath : [imagePath]));
    // console.log(filePath)

    // const resolvedPath = path.join(...(Array.isArray(imagePath) ? imagePath : [imagePath]));




    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
        res.status(404).send('Image not found');
        return;
    }

    // Устанавливаем MIME-тип и отдаём файл
    res.setHeader('Content-Type', 'image/jpeg'); // Или другой MIME-тип, в зависимости от формата файла
    fs.createReadStream(filePath).pipe(res);
}
