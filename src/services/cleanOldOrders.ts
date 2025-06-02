import { getPayload } from 'payload';
import configPromise from '@payload-config'

/**
 * Удаляет из коллекции "orders" все заказы старше указанного количества дней
 * и возвращает количество удалённых документов.
 * @param days — период; заказы старше этого срока будут удалены
 */
export async function cleanOldOrders(days: number): Promise<number> {
    // вычисляем пороговую дату
    const payload = await getPayload({ config: configPromise })
    const result = await payload.delete({
        collection: 'orders',
        where: {
            createdAt: {
                less_than: days,
            },
        },
        overrideAccess: true, // если вызываете вне контекста авторизованного пользователя
    });

    // result.docs — массив удалённых документов
    const deletedCount = Array.isArray(result.docs) ? result.docs.length : 0;

    console.log(`Deleted ${deletedCount} orders older than ${days} days.`);
    return deletedCount;
}





