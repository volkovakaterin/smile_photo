export const Photos = {
    slug: 'photos', // Уникальный идентификатор коллекции
    labels: {
        singular: 'Photo',
        plural: 'Photos',
    },
    admin: {
        useAsTitle: 'title', // Поле, которое будет использоваться как заголовок
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
            label: 'Title', // Название фото
        },
        {
            name: 'location',
            type: 'text',
            required: true,
            label: 'Location', // Локация
        },
        {
            name: 'path',
            label: 'Path',
            type: 'text',
            required: true, //Путь
        },
        {
            name: 'price',
            label: 'Price',
            type: 'number',
            required: true, //Цена
        },
        {
            name: 'datetime',
            type: 'date',
            required: true,
            label: 'Date & Time', // Дата и время съёмки
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Description', // Описание
        },
    ],
};
//# sourceMappingURL=index.js.map