

import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface OrderData {
    tel_number: string,
}

export const createOrder = async (orderData: OrderData): Promise<Response> => {
    const response = await axios.post<Response>(`/api/orders`, orderData);
    return response.data;
};

export function useCreateOrder() {
    const { mutate, isPending, isError, isSuccess, data } = useMutation<Response, Error, OrderData>({
        mutationKey: ['add order'],
        mutationFn: createOrder,
    });

    return { mutate, isPending, isError, isSuccess, data }
}