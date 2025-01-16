import { authenticated } from '../../access/authenticated';
export const Users = {
    slug: 'users',
    access: {
        admin: authenticated,
        create: authenticated,
        delete: authenticated,
        read: authenticated,
        update: authenticated,
    },
    admin: {
        defaultColumns: ['name', 'email'],
        useAsTitle: 'name',
    },
    auth: true,
    fields: [
        {
            name: 'name',
            type: 'text',
        },
    ],
    timestamps: true,
};
//# sourceMappingURL=index.js.map