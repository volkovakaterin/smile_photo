
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { stringify } from 'qs-esm'


export interface OrdersResponse<T> {
    docs: T[]
    totalDocs: number
    limit: number
    totalPages: number
    page: number
    pagingCounter: number
    hasPrevPage: boolean
    hasNextPage: boolean
    prevPage: number | null
    nextPage: number | null
}

export const getOrders = async (status?: string | string[], phone?: string, page = 1, rowsPerPage = 100000): Promise<Response> => {
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
            page: page,
            limit: rowsPerPage,
        },
        { addQueryPrefix: true },
    )
    const response = await axios.get<Response>(`/api/orders${stringifiedQuery}`);
    return response.data;
};

export function useOrders(status?: string | string[], phone?: string, page = 1, rowsPerPage = 100000) {
    const { data, isLoading, error, isSuccess, isFetching, refetch } = useQuery({
        queryKey: ['orders', status, phone, page, rowsPerPage],
        queryFn: () => getOrders(status, phone, page, rowsPerPage),
        select: (data: any) => data,
    });

    return { orders: data, refetch }
}