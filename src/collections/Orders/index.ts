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
    fields: [
        {
            name: 'tel_number',
            type: 'text',
            required: true,
            label: 'Номер телефона',
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
