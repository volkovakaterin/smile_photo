import { Endpoint, PayloadRequest } from 'payload';
import processFolders from '@/services/processFolders';
import { bumpFoldersVersion } from '@/services/bumpFoldersVersion';

async function parseBody(req: PayloadRequest): Promise<any> {
    if (typeof (req as any).json === 'function') {
        return await (req as any).json();
    }

    const body: any = (req as any).body;
    if (body && typeof body.getReader === 'function') {
        return await new Response(body).json();
    }

    if (typeof body === 'string') {
        try { return JSON.parse(body); } catch { /* ignore */ }
    }
    return body ?? {};
}

const monitorFolders: Endpoint = {
    path: '/monitoring-folders',
    method: 'post',
    handler: async (req: PayloadRequest) => {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Метод не разрешен' }), { status: 405 });
        }

        const parsed = await parseBody(req);
        const { directoryPath } = (parsed ?? {}) as { directoryPath?: string };

        if (!directoryPath) {
            return new Response(JSON.stringify({
                success: false,
                message: 'directoryPath обязателен',
            }), { status: 400 });
        }

        try {
            const result = await processFolders(directoryPath);

            // Инкремент версии ТОЛЬКО после успеха
            await bumpFoldersVersion(req.payload);

            return new Response(JSON.stringify({
                success: true,
                message: 'Функция выполнена успешно',
                result,
            }), { status: 200 });
        } catch (error) {
            console.error(error);
            return new Response(JSON.stringify({
                success: false,
                message: 'Ошибка на сервере',
            }), { status: 500 });
        }
    },
};

export default monitorFolders;

