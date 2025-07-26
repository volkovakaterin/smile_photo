import { CollectionConfig } from 'payload';

const Orders: CollectionConfig = {
    slug: 'orders',
    labels: {
        singular: 'Заказ',
        plural: 'Заказы',
    },
    admin: {
        useAsTitle: 'tel_number',
    },
    hooks: {
        afterRead: [
            ({ doc }) => {
                if (Array.isArray(doc.images)) {
                    doc.images.sort((a, b) =>
                        a.image.localeCompare(b.image, 'ru', { sensitivity: 'base' })
                    );
                }
                return doc;
            },
        ],

    },
    fields: [
        {
            name: 'tel_number',
            type: 'text',
            required: false,
            label: 'Номер телефона',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'folder_name',
            type: 'text',
            required: false,
            label: 'Имя папки',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'number_photos_in_folders',
            type: 'array',
            required: false,
            label: 'Выбранные папки с кол-вом фото в них',
            fields: [{
                name: 'folder_name',
                type: 'text',
                required: false,
                label: 'Папка',
            }, {
                name: 'number_photos',
                type: 'number',
                required: false,
                label: 'Фото в папке',
            }],
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'images',
            type: 'array',
            required: false,
            label: 'Фотографии',
            fields: [
                {
                    name: 'image',
                    type: 'text',
                    required: true,
                    label: 'Изображение',
                },
                {
                    name: 'addedAt',
                    type: 'date',
                    required: true,
                    label: 'Дата добавления',
                    defaultValue: () => new Date().toISOString(),
                    admin: {
                        readOnly: true,
                    },
                },
                {
                    name: 'products',
                    type: 'array',
                    required: false,
                    label: 'Продукты с этим изображением',
                    fields: [
                        {
                            name: 'product',
                            type: 'text',
                            required: true,
                            label: 'Продукт',
                        },
                        {
                            name: 'label',
                            type: 'text',
                            required: true,
                            label: 'Название',
                        },
                        {
                            name: 'quantity',
                            type: 'number',
                            required: true,
                            label: 'Количество',
                        },
                        {
                            name: 'done',
                            type: 'checkbox',
                            required: true,
                            label: 'Сделан',
                            defaultValue: false,
                        }
                        ,
                        {
                            name: 'electronic_frame',
                            type: 'checkbox',
                            required: true,
                            label: 'Электронная рамка',
                            defaultValue: false,
                        }
                    ],
                },
            ],
        },
        {
            name: 'status',
            type: 'select',
            options: [
                {
                    label: 'Создан',
                    value: 'created',
                },
                {
                    label: 'Открыт',
                    value: 'open',
                },
                {
                    label: 'Закрыт',
                    value: 'closed',
                },
                {
                    label: 'Оплачен',
                    value: 'paid',
                },
            ],
            defaultValue: 'open',
            required: true,
        },
        {
            name: 'comment',
            type: 'text',
            required: false,
            label: 'Комментарий',

        },
    ],
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    timestamps: true,
};

export default Orders;
