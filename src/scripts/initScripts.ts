import express from 'express';
import payload from 'payload';
import config from '../payload.config';
import '../scheduler';
import 'dotenv/config';

const start = async () => {
    await payload.init({
        config,
        onInit: () => {
            console.log(`Payload Admin URL: ${payload.getAdminURL()}`);
        },
    });

    console.log('Payload успешно инициализирован');
};

start().catch((err) => {
    console.error('Ошибка при инициализации Payload:', err);
});


