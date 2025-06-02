
import { Endpoint, PayloadRequest } from 'payload';
import processFolders from '@/services/processFolders';


const monitorFolders: Endpoint = {
    path: '/monitoring-folders',
    method: 'post',
    handler: async (req: PayloadRequest) => {

        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Метод не разрешен' }), { status: 405 });
        }
        const parsedBody = typeof req.json === 'function' ? await req.json() : req.body;
        const { directoryPath } = parsedBody as { directoryPath: string };


        try {
            const result = await processFolders(directoryPath);
            return new Response(
                JSON.stringify({ success: true, message: 'Функция выполнена успешно', result }),
                { status: 200 }
            );
        } catch (error) {
            console.error(error);
            return new Response(
                JSON.stringify({ success: false, message: 'Ошибка на сервере' }),
                { status: 500 }
            );
        }
    },
};

export default monitorFolders;
