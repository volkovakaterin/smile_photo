import { formatSlugHook } from './formatSlug';
export const slugField = (fieldToUse = 'title', overrides = {}) => {
    const { slugOverrides, checkboxOverrides } = overrides;
    const checkBoxField = {
        name: 'slugLock',
        type: 'checkbox',
        defaultValue: true,
        admin: {
            hidden: true,
            position: 'sidebar',
        },
        ...checkboxOverrides,
    };
    // Expect ts error here because of typescript mismatching Partial<TextField> with TextField
    // @ts-expect-error
    const slugField = {
        name: 'slug',
        type: 'text',
        index: true,
        label: 'Slug',
        ...(slugOverrides || {}),
        hooks: {
            // Kept this in for hook or API based updates
            beforeValidate: [formatSlugHook(fieldToUse)],
        },
        admin: {
            position: 'sidebar',
            ...(slugOverrides?.admin || {}),
            components: {
                Field: {
                    path: '@/fields/slug/SlugComponent#SlugComponent',
                    clientProps: {
                        fieldToUse,
                        checkboxFieldPath: checkBoxField.name,
                    },
                },
            },
        },
    };
    return [slugField, checkBoxField];
};
//# sourceMappingURL=index.js.map