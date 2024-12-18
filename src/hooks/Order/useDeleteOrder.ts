

import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

export const deleteOrder = async (id: string): Promise<Response> => {
    const response = await axios.delete<Response>(`http://localhost:3000/api/orders/${id}`);
    return response.data;
};

export function useDeleteOrder() {
    const queryClient = useQueryClient();
    const { mutate, isPending, isError, isSuccess, data } = useMutation<Response, Error, string>({
        mutationKey: ['delete order'],
        mutationFn: deleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    return { mutate, isPending, isError, isSuccess, data }
}