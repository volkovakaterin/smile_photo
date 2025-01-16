export const groupOrdersByDate = (orders) => {
    // Группируем заказы по дате
    const grouped = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }); // Форматируем дату в дд.мм.гг
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(order);
        return acc;
    }, {});
    // Преобразуем объект в массив и сортируем по дате (начиная с новых)
    return Object.entries(grouped)
        .map(([date, orders]) => ({ date, orders }))
        .sort((a, b) => {
        const dateA = new Date(a.orders[0].createdAt).getTime();
        const dateB = new Date(b.orders[0].createdAt).getTime();
        return dateB - dateA;
    });
};
//# sourceMappingURL=groupOrdersByDate.js.map