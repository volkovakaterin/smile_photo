import { CollectionConfig } from 'payload';

const Products: CollectionConfig = {
    slug: 'products',
    labels: {
        singular: 'Формат',
        plural: 'Форматы',
    },
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Название формата',
        },
        {
            name: 'format',
            type: 'select',
            required: true,
            label: 'Тип формата',
            options: [
                {
                    label: 'Электронный',
                    value: 'electronic',
                },
                {
                    label: 'Печатный',
                    value: 'printed',
                },
            ],
            admin: {
                description: 'Выберите тип формат',
            },
        },
        {
            name: 'copies',
            type: 'select',
            required: true,
            label: 'Выбор кол-ва копий',
            options: [
                {
                    label: 'Можно выбрать несколько',
                    value: 'many_copies',
                },
                {
                    label: 'В единственном экземпляре',
                    value: 'single_copy',
                },
            ],
            admin: {
                description: 'Возможность выбора множества копий',
            },
        },
        {
            name: 'defolt',
            type: 'checkbox',
            required: true,
            label: 'Формат по умолчанию',
        },

    ],
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
    },
    timestamps: true,
};

export default Products;
