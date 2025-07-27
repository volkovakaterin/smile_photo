import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Endpoint, PayloadRequest } from 'payload';

interface ImageGroup {
    image: string;
    products: { label: string }[];
}

interface Order {
    id: string;
    images: ImageGroup[];
}

interface Product {
    format: "printed" | "electronic"
    id: string;
    name: string;
    size: { id: string, name: string }
}

const createArchive: Endpoint = {
    path: '/create-archive',
    method: 'post',
    handler: async (req: PayloadRequest) => {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
        }
        // --- 1. Считываем весь ReadableStream из req.body в строку ---
        let rawBody: string;
        try {
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
        let parsed: { order: Order; dir: string, products: Product[] };
        try {
            parsed = JSON.parse(rawBody) as { order: Order; dir: string, products: Product[] };
        } catch (e) {
            console.error('Ошибка JSON.parse:', e);
            return new Response(
                JSON.stringify({ error: 'Request body is not valid JSON' }),
                { status: 400 }
            );
        }

        const { order, dir, products } = parsed;

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
                        // 1) Собираем ID продуктов из imageGroup.products
                        const prodIds = imageGroup.products.map(p => p.label);
                        // 2) Находим объекты Product по этим ID
                        const related = products.filter(p => prodIds.includes(p.name));
                        if (related.length === 0) continue;

                        // 3) Для каждого printed — отдельная папка по size.name
                        const printedItems = related.filter(p => p.format === 'printed');
                       const seenSizes = new Set<string>();
                        for (const prod of printedItems) {
                            if (prod.size) {
                             const sizeName = prod.size.name.replace(/[/\\:*?"<>|]/g, '_');

                               if (seenSizes.has(sizeName)) continue;
                                  seenSizes.add(sizeName);
                               
                                  const imagePath = decodeURIComponent(imageGroup.image);

                                if (!fs.existsSync(imagePath)) continue;
                                const fileName = path.basename(imagePath);

                                archive.file(imagePath, { name: `${sizeName}/${fileName}` });
                            }
                        }



                        // 4) Если есть electronic — кладём в корень
                        if (related.some(p => p.format === 'electronic')) {
                            const imagePath = decodeURIComponent(imageGroup.image);
                            if (!fs.existsSync(imagePath)) continue;
                            archive.file(imagePath, { name: path.basename(imagePath) });
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

