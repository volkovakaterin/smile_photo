import type { GlobalConfig } from 'payload'

export const OrderCreationMode: GlobalConfig = {
    slug: 'order-creation-mode',
    label: 'Способ создания заказа',
    fields: [
        {
            name: 'mode',
            label: 'Способ создания заказа',
            type: 'select',
            options: [
                {
                    label: 'Создание заказа по номеру телефона',
                    value: 'create_order_number',
                },
                {
                    label: 'Создание заказа по имени папки',
                    value: 'create_order_folder',
                },
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
