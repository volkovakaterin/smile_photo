// import fs from 'fs';
// import path from 'path';
// import archiver from 'archiver';
// import payload, { Endpoint } from 'payload';

// interface Product {
//     label: string;
// }

// interface ImageGroup {
//     image: string;
//     products: Product[];
// }

// interface Order {
//     id: string;
//     images: ImageGroup[];
// }

// const createArchive: Endpoint = {
//     path: '/create-archive',
//     method: 'post',
//     handler: async (req) => {
//         if (req.method !== 'POST') {
//             return Response.json({ error: 'Method not allowed' }, { status: 405 });
//         }

//         const { order, dir }: { order: Order, dir: { archives: string, photos: string } } = req.query as { order: Order, dir: { archives: string, photos: string } };

//         if (!order) {
//             return Response.json({ error: 'Order ID is required' }, { status: 400 });
//         }

//         const dirArchives = dir.archives;
//         const dirPhotos = dir.photos;

//         try {
//             const orderData = order;
//             // Укажите путь для сохранения архива
//             const archivePath = path.join(dirArchives, `${orderData.id}.zip`);
//             const output = fs.createWriteStream(archivePath);
//             const archive = archiver('zip', { zlib: { level: 9 } });

//             archive.pipe(output);

//             // Добавление файлов в архив
//             if (orderData.images) {
//                 for (const imageGroup of orderData.images) {
//                     for (const product of imageGroup.products) {
//                         const productDir = `${product.label}`;
//                         const imagePath = path.join(dirPhotos, imageGroup.image);

//                         if (fs.existsSync(imagePath)) {
//                             archive.file(imagePath, { name: `${productDir}/${path.basename(imagePath)}` });
//                         }
//                     }
//                 }

//                 await archive.finalize();


//                 return Response.json({ message: 'Archive created successfully', path: archivePath }, { status: 200 })
//             } else {
//                 return Response.json({ error: 'No images found in the order' }, { status: 404 })

//             }

//         } catch (error) {
//             console.error('Error creating archive:', error);
//             return Response.json({ error: 'Failed to create archive' }, { status: 500 })

//         }
//     }
// }

// export default createArchive;

import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Endpoint, PayloadRequest } from 'payload';

interface Product {
    label: string;
}

interface ImageGroup {
    image: string;
    products: Product[];
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
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        console.log(req.body, 'ТЕЛО ЗАПРОСА');

        const { order, dir } = req.query as {
            order: {
                id: string;
                tel_number: string;
                status: string;
                createdAt: string;
                updatedAt: string;
                images: ImageGroup[];
            };
            dir: {
                archives: string;
                photos: string;
            };
        };

        if (!order) {
            return Response.json({ error: 'Order is required' }, { status: 400 });
        }

        const dirPhotos = dir.photos;

        try {
            const orderData = order;

            // Создаем поток архива
            const archive = archiver('zip', { zlib: { level: 9 } });
            const chunks: Buffer[] = [];

            // Слушаем события потока для формирования ответа
            archive.on('data', (chunk) => chunks.push(chunk));
            archive.on('error', (err) => {
                console.error('Error creating archive:', err);
                throw err;
            });

            // Добавление файлов в архив
            if (orderData.images) {
                for (const imageGroup of orderData.images) {
                    for (const product of imageGroup.products) {
                        const productDir = `${product.label}`;
                        const imagePath = path.join(dirPhotos, imageGroup.image);

                        if (fs.existsSync(imagePath)) {
                            archive.file(imagePath, { name: `${productDir}/${path.basename(imagePath)}` });
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
                return Response.json({ error: 'No images found in the order' }, { status: 404 });
            }
        } catch (error) {
            console.error('Error creating archive:', error);
            return Response.json({ error: 'Failed to create archive' }, { status: 500 });
        }
    },
};

export default createArchive;





