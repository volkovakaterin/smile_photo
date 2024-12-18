// import { Endpoint } from "payload";

// const findFolders: Endpoint = {
//     path: '/custom-api/folders',
//     method: 'get',
//     handler: async (req) => {
//         const { basePath, limit } = req.query;
//         console.log('Кастомный запрос-1')
//         try {
//             console.log('Кастомный запрос-2')
//             const query: any = {};
//             if (basePath) {
//                 query.path = { equals: basePath }; // Добавляем только если basePath указан
//             }

//             const folders = await req.payload.find({
//                 collection: 'folders',
//                 where: query,
//                 limit: limit ? parseInt(limit as string, 10) : 1000, // Устанавливаем ограничение
//             });
//             return Response.json({ folders }, { status: 200 })
//         } catch (error) {
//             console.error('Ошибка получения папок:', error);
//             return Response.json({ error: 'Не удалось загрузить папки.' }, { status: 500 })
//         }
//     },
// }

// export default findFolders;
