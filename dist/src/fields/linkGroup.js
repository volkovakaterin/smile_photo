import deepMerge from '@/utilities/deepMerge';
import { link } from './link';
export const linkGroup = ({ appearances, overrides = {} } = {}) => {
    const generatedLinkGroup = {
        name: 'links',
        type: 'array',
        fields: [
            link({
                appearances,
            }),
        ],
    };
    return deepMerge(generatedLinkGroup, overrides);
};
//# sourceMappingURL=linkGroup.js.map