import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Endpoint, PayloadRequest } from 'payload';

interface ImageGroup {
    image: string;
    products: any[];
    print?: boolean;
}

interface Order {
    id: string;
    images: ImageGroup[];
}

const createArchive: Endpoint = {
    path: '/create-archive',
    method: 'post',
    handler: async (req: PayloadRequest) => {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
        }

        // const { order } = req.query as {
        //     order: {
        //         id: string;
        //         images: ImageGroup[];
        //     };
        // };
        // --- 1. Считываем весь ReadableStream из req.body в строку ---
        let rawBody: string;
        try {
            // Вспособ, который работает в среде Payload/Next.js:
            const text = await new Response(req.body).text();
            rawBody = text;
        } catch (e) {
            console.error('Не удалось прочитать тело запроса как текст:', e);
            return new Response(
                JSON.stringify({ error: 'Invalid request body' }),
                { status: 400 }
            );
        }

        // --- 2. Парсим JSON из полученной строки ---
        let parsed: { order: Order; dir: string };
        try {
            parsed = JSON.parse(rawBody) as { order: Order; dir: string };
        } catch (e) {
            console.error('Ошибка JSON.parse:', e);
            return new Response(
                JSON.stringify({ error: 'Request body is not valid JSON' }),
                { status: 400 }
            );
        }

        const { order, dir } = parsed;



        console.log("ЗАКАЗ", order)

        if (!order) {
            return new Response(JSON.stringify({ error: 'Order is required' }), { status: 400 });
        }

        try {
            const orderData = order;

            const archive = archiver('zip', { zlib: { level: 9 } });
            const chunks: Buffer[] = [];

            archive.on('data', (chunk) => chunks.push(chunk));
            archive.on('error', (err) => {
                console.error('Error creating archive:', err);
                throw err;
            });

            if (orderData.images) {
                for (const imageGroup of orderData.images) {
                    if (imageGroup.products) {
                        const imagePath = decodeURIComponent(imageGroup.image);
                        if (fs.existsSync(imagePath)) {
                            archive.file(imagePath, { name: path.basename(imagePath) });
                            // Если print === true, дублируем в папку "print/"
                            if (imageGroup.print) {
                                archive.file(imagePath, { name: `print/${path.basename(imagePath)}` });
                            }
                        }
                    }
                }

                await archive.finalize();

                const archiveBuffer = Buffer.concat(chunks);

                return new Response(archiveBuffer, {
                    status: 200,
                    headers: {
                        'Content-Disposition': `attachment; filename="${orderData.id}.zip"`,
                        'Content-Type': 'application/zip',
                    },
                });
            } else {
                return new Response(JSON.stringify({ error: 'No images found in the order' }), { status: 404 });
            }
        } catch (error) {
            console.error('Error creating archive:', error);
            return new Response(JSON.stringify({ error: 'Failed to create archive' }), { status: 500 });
        }
    },
};

export default createArchive;

