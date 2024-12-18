import { CollectionConfig } from 'payload';

const Directories: CollectionConfig = {
    slug: 'directories',
    labels: {
        singular: 'Directory',
        plural: 'Directories',
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
            access: {
                read: () => true,
                create: () => false,
                update: () => false,
            }
        },

    ],
    access: {
        read: () => true,
        create: async ({ req: { payload } }) => {
            const existingRecords = await payload.find({
                collection: 'directories',
                depth: 0,
            });

            // Disallow creation if there are already 2 records
            return existingRecords.docs.length < 2;
        },
        update: () => true,
        delete: () => false, // Disallow deletion of all records
    },
    hooks: {
        afterRead: [
            async ({ doc, req }) => {
                // Убедитесь, что количество документов ограничено 2
                if (Array.isArray(doc) && doc.length > 2) {
                    throw new Error('Only two directories are allowed in this collection.');
                }
                return doc;
            },
        ],
        beforeChange: [
            async ({ operation, req, data }) => {
                // Enforce validation before any operation (e.g., ensure correct structure)
                if (operation === 'create') {
                    const existing = await req.payload.find({
                        collection: 'directories',
                        depth: 0,
                    });

                    if (existing.docs.length >= 2) {
                        throw new Error('Cannot create more than two directories.');
                    }
                }
                return data;
            },
        ],
    },
    timestamps: true,
};

export default Directories;
