export const FunctionalMode = {
    slug: 'functional-mode',
    label: 'Переключение функционала',
    fields: [
        {
            name: 'mode',
            label: 'Переключение функционала',
            type: 'select',
            options: [
                {
                    label: 'С форматами',
                    value: 'with_formats',
                },
                {
                    label: 'Без форматов',
                    value: 'without_formats',
                },
            ],
            defaultValue: 'with_formats',
            required: true,
        },
    ],
    access: {
        read: () => true,
        update: () => true
    },
};
//# sourceMappingURL=config.js.map