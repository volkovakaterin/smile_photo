import { CollectionConfig } from 'payload';

const Folders: CollectionConfig = {
    slug: 'folders',
    labels: {
        singular: 'Папка',
        plural: 'Папки',
    },
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Название папки',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'path',
            type: 'text',
            label: 'Локальный путь',
            admin: {
                readOnly: true,
            },
        },
        {
            name: 'with_photo',
            type: 'checkbox',
            label: 'Наличие фото',
            admin: {
                readOnly: true,
            },
        },
    ],
    access: {
        read: () => true,
    },
    timestamps: true,
};

export default Folders;
