
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

export interface PhotoOrder {
    image: string,
    products: { product: string, quantity: number }[],
}

const url = process.env.NEXT_PUBLIC_SERVER_URL

export const changeStatusOrder = async (data: { status: boolean, id: string }): Promise<Response> => {
    const response = await axios.patch<Response>(`/api/orders/${data.id}`,
        { status: data.status });
    return response.data;
};

export function useChangeStatusOrder() {
    const { mutate, isPending, isError, isSuccess } = useMutation<Response, Error, { status: boolean, id: string }>({
        mutationKey: ['change status order'],
        mutationFn: changeStatusOrder,
    });

    return { mutate, isPending, isError, isSuccess }
}

export const useStatusChangeOrder = () => {
    const { mutate: changeStatus } = useChangeStatusOrder();
    const queryClient = useQueryClient();



    const handleChangeStatusOrder = (status, orderId) => {
        if (!orderId) {
            console.error('Заказ не открыт.');
            return;
        }

        changeStatus(
            { status, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка ', error);
                },
            }
        );

    }
    return { handleChangeStatusOrder }
}