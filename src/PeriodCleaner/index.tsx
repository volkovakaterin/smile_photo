import type { GlobalConfig } from 'payload'

export const PeriodCleaner: GlobalConfig = {
    slug: 'period-cleaner',
    label: 'Период очистки программы',
    fields: [
        {
            name: 'period',
            label: 'Кол-во дней',
            type: 'number',
        },
    ],
    access: {
        read: () => true,
        update: () => true
    },
}
