
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { stringify } from 'qs-esm'

const limit = 100000;
const url = process.env.NEXT_PUBLIC_SERVER_URL;

export const getProducts = async (): Promise<Response> => {
    const stringifiedQuery = stringify(
        {
            limit,
        },
        { addQueryPrefix: true },
    )
    const response = await axios.get<Response>(`${url}/api/products${stringifiedQuery}`);
    return response.data;
};

export function useProducts() {
    const { data, isLoading, error, isSuccess, isFetching } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
        select: (data: any) => data,
    });

    return { products: data }
}