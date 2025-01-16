const Products = {
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
    ],
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
    },
    timestamps: true,
};
export default Products;
//# sourceMappingURL=index.js.map