import cron, { ScheduledTask } from 'node-cron';
import { getPeriodMonitoring } from './requests/getPeriodMonitoring';
import processFoldersCron from './services/processFoldersCron';

let task: ScheduledTask | null = null;

async function scheduleProcessFolders() {
    const period = await getPeriodMonitoring();
    const expr = `*/${period} * * * *`;

    // 1) Останавливаем старую задачу (если есть)
    if (task) {
        task.stop();
    }

    // 2) Планируем новую
    task = cron.schedule(expr, async () => {
        try {

            await processFoldersCron();
        } catch (e) {
            console.error('Ошибка в processFolders:', e);
        }
    });

    console.log(`🕒 processFolders запланирован: ${expr}`);
}

// инициализируем сразу
scheduleProcessFolders();
// и перепланируем раз в минуту на случай правки интервала или пути
setInterval(scheduleProcessFolders, 60_000);
