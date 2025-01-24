
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const url = process.env.NEXT_PUBLIC_SERVER_URL;

export const getOrderId = async (id: string | null): Promise<Response> => {
    const response = await axios.get<Response>(`/api/orders/${id}`);
    return response.data;
};

export function useOrderId(id: string | null) {
    const { data, isLoading, error, isSuccess, isFetching } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrderId(id),
        select: (data: any) => data,
        enabled: !!id
    });

    return { order: data }
}
