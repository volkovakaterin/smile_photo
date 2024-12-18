
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { stringify } from 'qs-esm'

const limit = 100000;

export const getProducts = async (): Promise<Response> => {
    const stringifiedQuery = stringify(
        {
            limit,
        },
        { addQueryPrefix: true },
    )
    const response = await axios.get<Response>(`http://localhost:3000/api/products${stringifiedQuery}`);
    console.log(response.data);
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