import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Endpoint, PayloadRequest } from 'payload';

interface ImageGroup {
    image: string;
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

        const { order, dir } = req.query as {
            order: {
                id: string;
                images: ImageGroup[];
            };
            dir: {
                photos: string;
            };
        };

        if (!order) {
            return new Response(JSON.stringify({ error: 'Order is required' }), { status: 400 });
        }

        const dirPhotos = dir.photos;

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
                    const imagePath = path.join(dirPhotos, imageGroup.image);

                    if (fs.existsSync(imagePath)) {
                        archive.file(imagePath, { name: path.basename(imagePath) });
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


