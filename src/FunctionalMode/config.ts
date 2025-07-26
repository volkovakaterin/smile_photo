import type { GlobalConfig } from 'payload'

export const FunctionalMode: GlobalConfig = {
    slug: 'functional-mode',
    label: 'Переключение функционала',
    fields: [
        {
            name: 'mode',
            label: 'Переключение функционала',
            type: 'select',
            options: [
                // {
                //     label: 'С форматами',
                //     value: 'with_formats',
                // },
                {
                    label: 'Без форматов',
                    value: 'without_formats',
                }
            ],
            defaultValue: 'create_order_number',
            required: true,
        },
    ],
    access: {
        read: () => true,
        update: () => true
    },
}
