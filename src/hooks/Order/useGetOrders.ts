
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { stringify } from 'qs-esm'

const limit = 1000000;

const url = process.env.NEXT_PUBLIC_SERVER_URL;

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
    const response = await axios.get<Response>(`${url}/api/orders${stringifiedQuery}`);
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