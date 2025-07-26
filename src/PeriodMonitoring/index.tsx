import type { GlobalConfig } from 'payload'

export const PeriodMonitoring: GlobalConfig = {
    slug: 'period-monitoring',
    label: 'Период мониторинга папок',
    fields: [
        {
            name: 'period',
            label: 'Кол-во минут',
            type: 'number',
        },
    ],
    access: {
        read: () => true,
        update: () => true
    },
}
