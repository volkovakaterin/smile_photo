import payload from 'payload';
import config from '../payload.config';
import '../scheduler';
import 'dotenv/config';

const start = async () => {
    await payload.init({
        config,
        onInit: () => {
        },
    });
};

start().catch((err) => {
    console.error('Ошибка при инициализации Payload:', err);
});


