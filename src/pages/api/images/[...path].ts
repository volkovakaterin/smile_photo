import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path: imagePath } = req.query;

    if (!imagePath) {
        res.status(400).send('Image path is required');
        return;
    }

    const filePath = path.join('/', ...(Array.isArray(imagePath) ? imagePath : [imagePath]));

    if (!fs.existsSync(filePath)) {
        res.status(404).send('Image not found');
        return;
    }

    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(filePath).pipe(res);
}
