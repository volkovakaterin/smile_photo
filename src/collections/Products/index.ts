import { CollectionConfig } from 'payload';

const Products: CollectionConfig = {
    slug: 'products',
    labels: {
        singular: 'Product',
        plural: 'Products',
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

    ],
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
    },
    timestamps: true,
};

export default Products;
