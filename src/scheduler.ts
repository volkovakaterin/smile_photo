import cron from 'node-cron';

import processFolders from './cron/processFolders';
import validateFoldersInDatabase from './cron/removeDeletedFolders';


cron.schedule('*/10 * * * *', async () => {
    console.log('Запуск задачи каждые 10 мин ...');
    await processFolders();
    await validateFoldersInDatabase();
});
console.log('Планировщик задач инициализирован.');
