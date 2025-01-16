import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
const sanitizeFileName = (name) => {
    return name.replace(/[^\w\-\.]/g, '_'); // Убираем неподдерживаемые символы
};
const parseRequestBody = async (stream) => {
    const reader = stream.getReader();
    const chunks = [];
    let done = false;
    while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) {
            chunks.push(value);
        }
        done = streamDone;
    }
    const bodyString = new TextDecoder().decode(Buffer.concat(chunks));
    return JSON.parse(bodyString);
};
const savePhotoFormat = {
    path: '/save-photo',
    method: 'post',
    handler: async (req) => {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }
        try {
            const body = await parseRequestBody(req.body);
            // Получаем параметры из тела запроса
            const { imagePath, imageName } = body.params;
            if (!imagePath || !imageName) {
                return Response.json({ error: 'Image path and name are required' }, { status: 400 });
            }
            // Очищаем имя файла и задаем формат
            const sanitizedFileName = sanitizeFileName(imageName);
            const format = 'jpeg';
            const fileNameWithExtension = `${sanitizedFileName}.${format}`;
            const outputPath = path.join('/tmp', fileNameWithExtension);
            // Обрабатываем изображение
            await sharp(imagePath)
                .toFormat(format)
                .toFile(outputPath);
            // Читаем файл
            const fileBuffer = fs.readFileSync(outputPath);
            // Возвращаем файл с корректным именем
            return new Response(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Disposition': `attachment; filename="${fileNameWithExtension}"`,
                    'Content-Type': `image/${format}`,
                },
            });
        }
        catch (error) {
            console.error('Error processing image:', error);
            return Response.json({ error: 'Failed to process image' }, { status: 500 });
        }
    },
};
export default savePhotoFormat;
//# sourceMappingURL=savePhotoFormat.js.map