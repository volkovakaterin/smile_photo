import cron from 'node-cron';

import processFolders from './cron/processFolders';
import validateFoldersInDatabase from './cron/removeDeletedFolders';


cron.schedule('*/5 * * * *', async () => {
    console.log('расписание')
    await processFolders();
    await validateFoldersInDatabase();
});

