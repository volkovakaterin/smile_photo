import { CollectionConfig } from 'payload';

const Products: CollectionConfig = {
    slug: 'products',
    labels: {
        singular: 'Товар',
        plural: 'Товары',
    },
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Название товара',
        },
        {
            name: 'format',
            type: 'select',
            required: true,
            label: 'Тип товара',
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
                description: 'Выберите тип товара',
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
            name: 'size',
            type: 'relationship',
            relationTo: 'formats',
            hasMany: false,
            required: false,
            label: 'Формат',
            admin: {
                description: 'Выберите формат из справочника Formats',
                allowCreate: false,
                allowEdit: false,

            },
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
