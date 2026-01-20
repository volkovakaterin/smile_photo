import { Endpoint, PayloadRequest } from 'payload';
import processFolders from '@/services/processFolders';
import { bumpFoldersVersion } from '@/services/bumpFoldersVersion';
import { tryAcquireMonitoringLock, releaseMonitoringLock } from '@/services/monitoringLock';

async function parseBody(req: PayloadRequest): Promise<any> {
    if (typeof (req as any).json === 'function') return await (req as any).json();

    const body: any = (req as any).body;
    if (body && typeof body.getReader === 'function') return await new Response(body).json();

    if (typeof body === 'string') {
        try { return JSON.parse(body); } catch { }
    }
    return body ?? {};
}

const monitorFolders: Endpoint = {
    path: '/monitoring-folders',
    method: 'post',
    handler: async (req: PayloadRequest) => {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ success: false, message: 'Метод не разрешен' }), { status: 405 });
        }

        const parsed = await parseBody(req);
        const { directoryPath, scope } = (parsed ?? {}) as {
            directoryPath?: string;
            scope?: 'all' | 'today';
        };

        if (!directoryPath) {
            return new Response(JSON.stringify({ success: false, message: 'directoryPath обязателен' }), { status: 400 });
        }

        const effectiveScope: 'all' | 'today' = scope === 'today' ? 'today' : 'all';

        const now = Date.now();

        const lock = tryAcquireMonitoringLock(effectiveScope);
        if (!lock.ok) {
            return new Response(JSON.stringify({
                success: false,
                message: `Мониторинг уже выполняется (${lock.lockedBy?.scope ?? 'unknown'})`,
            }), { status: 409 });
        }

        try {
            const result = await processFolders(req.payload, directoryPath, { scope: effectiveScope });

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
        } finally {
            releaseMonitoringLock();
        }
    },
};

export default monitorFolders;

