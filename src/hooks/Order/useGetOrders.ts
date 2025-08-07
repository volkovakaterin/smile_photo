
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

export const getOrders = async (
    status?: string | string[],
    search?: { phone?: string; nameFolder?: string },
    page = 1,
    rowsPerPage = 100000
): Promise<Response> => {
    const query: any = {};

    if (status) {
        query.status = Array.isArray(status)
            ? { in: status }
            : { equals: status };
    }

    if (search?.phone) {
        query.tel_number = { equals: search.phone };
    }

    if (search?.nameFolder) {
        query.folder_name = { equals: search.nameFolder };
    }

    const stringifiedQuery = stringify(
        {
            where: query,
            page,
            limit: rowsPerPage,
        },
        { addQueryPrefix: true }
    );

    const response = await axios.get<Response>(`/api/orders${stringifiedQuery}`);
    return response.data;
};

export function useOrders(
    status?: string | string[],
    search?: { phone?: string; nameFolder?: string },
    page = 1,
    rowsPerPage = 100000
) {
    const { data, refetch, isLoading, isSuccess, error } = useQuery({
        queryKey: ['orders', status, search, page, rowsPerPage],
        queryFn: () => getOrders(status, search, page, rowsPerPage),
        select: (data: any) => data,
    });

    return {
        orders: data,
        refetch,
        isLoading,
        isSuccess,
        error,
    };
}