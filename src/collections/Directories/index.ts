import { CollectionConfig } from 'payload';

const Directories: CollectionConfig = {
    slug: 'directories',
    labels: {
        singular: 'Директория',
        plural: 'Директории',
    },
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Название директории',
        },
        {
            name: 'path',
            type: 'text',
            required: true,
            label: 'Путь директории',
        },
        {
            name: 'service_name',
            type: 'text',
            required: true,
            label: 'Сервисное имя',
            unique: true,
            access: {
                read: () => true,
                create: () => true,
                update: () => true,
            }
        },
    ],
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
    },
    timestamps: true
};

export default Directories;
