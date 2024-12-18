import payload from 'payload';
import config from '../payload.config';
import '../scheduler';
require('dotenv').config();
console.log('ВЫВОД ИЗ initApp');
const start = async () => {
    await payload.init({
        config, // Укажите конфигурацию
        onInit: () => {
            console.log(`Payload Admin URL: ${payload.getAdminURL()}`);
        },
    });
    console.log('Payload успешно инициализирован');
};
start();
// .catch((err) => {
//     console.error('Ошибка при инициализации Payload:', err);
// });
//# sourceMappingURL=initScripts.js.map