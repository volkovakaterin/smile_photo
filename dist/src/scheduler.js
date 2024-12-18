import cron from 'node-cron';
import processPhotos from './cron/processPhotos';
cron.schedule('*/5 * * * *', async () => {
    console.log('Запуск задачи каждые 5 мин ...');
    await processPhotos();
});
console.log('Планировщик задач инициализирован.');
//# sourceMappingURL=scheduler.js.map