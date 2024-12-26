import cron from 'node-cron';

import processFolders from './cron/processFolders';
import validateFoldersInDatabase from './cron/removeDeletedFolders';


cron.schedule('*/5 * * * *', async () => {
    await processFolders();
    await validateFoldersInDatabase();
});

