import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { stringify } from 'qs-esm';
const limit = 100000;
const url = process.env.NEXT_PUBLIC_SERVER_URL;
export const getProducts = async () => {
    const stringifiedQuery = stringify({
        limit,
    }, { addQueryPrefix: true });
    const response = await axios.get(`${url}/api/products${stringifiedQuery}`);
    return response.data;
};
export function useProducts() {
    const { data, isLoading, error, isSuccess, isFetching } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
        select: (data) => data,
    });
    return { products: data };
}
//# sourceMappingURL=useGetProducts.js.map