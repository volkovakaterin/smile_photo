
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { stringify } from 'qs-esm'

const limit = 100000;

export const getOrders = async (status?: string | string[], phone?: string): Promise<Response> => {
    const query: any = {};

    if (status) {
        if (Array.isArray(status)) {
            query.status = { in: status };
        } else {
            query.status = { equals: status };
        }
    }
    if (phone) {
        query.tel_number = { equals: phone };
    }
    const stringifiedQuery = stringify(
        {
            where: query,
            limit,
        },
        { addQueryPrefix: true },
    )
    const response = await axios.get<Response>(`http://localhost:3000/api/orders${stringifiedQuery}`);
    console.log(response.data);
    return response.data;
};

export function useOrders(status?: string | string[], phone?: string) {
    const { data, isLoading, error, isSuccess, isFetching } = useQuery({
        queryKey: ['orders', status, phone],
        queryFn: () => getOrders(status, phone),
        select: (data: any) => data,
    });

    return { orders: data }
}