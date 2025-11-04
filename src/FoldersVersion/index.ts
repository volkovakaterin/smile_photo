import type { GlobalConfig } from 'payload';


export const FoldersVersion: GlobalConfig = {
    slug: 'folders-version',
    label: 'Версия папок',
    fields: [
        {
            name: 'foldersVersion',
            type: 'number',
            defaultValue: 0,
            required: true,
            admin: { readOnly: true },
        },
    ],
    access: {
        read: () => true,
        update: () => false,
    },
};
