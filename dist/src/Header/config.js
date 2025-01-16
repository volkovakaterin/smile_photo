import { link } from '@/fields/link';
import { revalidateHeader } from './hooks/revalidateHeader';
export const Header = {
    slug: 'header',
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'navItems',
            type: 'array',
            fields: [
                link({
                    appearances: false,
                }),
            ],
            maxRows: 6,
        },
    ],
    hooks: {
        afterChange: [revalidateHeader],
    },
};
//# sourceMappingURL=config.js.map