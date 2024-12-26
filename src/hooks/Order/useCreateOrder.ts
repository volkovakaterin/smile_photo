

import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface OrderData {
    tel_number: string,
}

const url = process.env.NEXT_PUBLIC_SERVER_URL

export const createOrder = async (orderData: OrderData): Promise<Response> => {
    const response = await axios.post<Response>(`${url}/api/orders`, orderData);
    return response.data;
};

export function useCreateOrder() {
    const { mutate, isPending, isError, isSuccess, data } = useMutation<Response, Error, OrderData>({
        mutationKey: ['add order'],
        mutationFn: createOrder,
    });

    return { mutate, isPending, isError, isSuccess, data }
}