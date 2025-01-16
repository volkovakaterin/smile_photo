import payload from 'payload';
import config from '../payload.config';
import '../scheduler';
import 'dotenv/config';
import { initDirectories } from '@/services/initDirectories';
console.log('инициализация');
const start = async () => {
    await payload.init({
        config,
        onInit: async (payload) => {
            await initDirectories(payload);
        },
    });
};
start().catch((err) => {
    console.error('Ошибка при инициализации Payload:', err);
});
//# sourceMappingURL=initScripts.js.map