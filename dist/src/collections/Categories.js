import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';
export const Categories = {
    slug: 'categories',
    access: {
        create: authenticated,
        delete: authenticated,
        read: anyone,
        update: authenticated,
    },
    admin: {
        useAsTitle: 'title',
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
    ],
};
//# sourceMappingURL=Categories.js.map