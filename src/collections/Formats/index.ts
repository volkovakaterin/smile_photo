import { CollectionConfig } from 'payload';

const Formats: CollectionConfig = {
    slug: 'formats',
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
    ],
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    timestamps: true,
};

export default Formats;
