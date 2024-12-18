export const Code = {
    slug: 'code',
    interfaceName: 'CodeBlock',
    fields: [
        {
            name: 'language',
            type: 'select',
            defaultValue: 'typescript',
            options: [
                {
                    label: 'Typescript',
                    value: 'typescript',
                },
                {
                    label: 'Javascript',
                    value: 'javascript',
                },
                {
                    label: 'CSS',
                    value: 'css',
                },
            ],
        },
        {
            name: 'code',
            type: 'code',
            label: false,
            required: true,
        },
    ],
};
//# sourceMappingURL=config.js.map