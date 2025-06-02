import { Endpoint, PayloadRequest } from 'payload';
import { cleanOldOrders } from '@/services/cleanOldOrders';


const processCleanerEndpoint: Endpoint = {
    path: '/process-cleaner',
    method: 'post',
    handler: async (req: PayloadRequest) => {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Метод не разрешен' }), { status: 405 });
        }

        const parsedBody = typeof req.json === 'function'
            ? await req.json()
            : req.body;

        // Параметр period используем и для файлов, и для ордеров
        const { period } = parsedBody as {
            period: number;
        };
        const days = Date.now() - period * 24 * 60 * 60 * 1000;
        try {
            // 2) Чистим заказы в БД, старше period дней
            const deletedOrdersCount = await cleanOldOrders(days);

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Очистка выполнена успешно',
                    deletedOrdersCount,    // число удалённых заказов
                }),
                { status: 200 }
            );
        } catch (error) {
            console.error('Error in process-cleaner endpoint:', error);
            return new Response(
                JSON.stringify({ success: false, message: 'Ошибка на сервере' }),
                { status: 500 }
            );
        }
    },
};

export default processCleanerEndpoint;

