import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface EditCommentPayload {
    id: string;
    comment: string;
}

export interface OrderResponse {
    id: string;
    status: string;
    tel_number: string;
    createdAt: string;
    updatedAt: string;
    images: any[];
    comment: string;
}

/** 
 * Патчим только поле comment у заказа 
 */
async function editCommentOrder({ id, comment }: EditCommentPayload): Promise<OrderResponse> {
    const { data } = await axios.patch<OrderResponse>(`/api/orders/${id}`, { comment });
    return data;
}

/**
 * React-хук для редактирования комментария в заказе.
 * При успехе инвалидирует квери с ключами ['orders'] и ['order', id].
 */
export function useEditCommentOrder() {
    const queryClient = useQueryClient();

    return useMutation<OrderResponse, Error, EditCommentPayload>({
        mutationKey: ['edit order comment'],
        mutationFn: editCommentOrder,
        onSuccess: (updated) => {
            // Обновляем список заказов и детали конкретного заказа
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', updated.id] });
        },
    });
}
