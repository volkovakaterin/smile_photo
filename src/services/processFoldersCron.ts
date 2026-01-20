import payload from 'payload';
import processFolders from '@/services/processFolders';
import { tryAcquireMonitoringLock, releaseMonitoringLock } from '@/services/monitoringLock';

const processFoldersCron = async () => {
    // cron всегда today
    const lock = tryAcquireMonitoringLock('today');
    if (!lock.ok) {
        console.log(`processFoldersCron: пропуск, мониторинг уже выполняется (${lock.lockedBy?.scope})`);
        return;
    }

    try {
        const dirRes = await payload.find({
            collection: 'directories',
            where: { service_name: { equals: 'photo_directory' } },
            limit: 1,
            depth: 0,
        });

        if (!dirRes.docs.length) {
            throw new Error('Не найдена директория с service_name: photo_directory');
        }

        const photosDirectory: string = (dirRes.docs[0] as any).path;
        const normalized = photosDirectory.replace(/\\/g, '/').replace(/\/+$/, '');

        const result = await processFolders(payload, normalized, { scope: 'today' });

        console.log('processFoldersCron(today) завершено:', result);
    } catch (e) {
        console.error('Ошибка в processFoldersCron:', e);
    } finally {
        releaseMonitoringLock();
    }
};

export default processFoldersCron;
