import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
const url = process.env.NEXT_PUBLIC_SERVER_URL;
export const getOrderId = async (id) => {
    const response = await axios.get(`${url}/api/orders/${id}`);
    return response.data;
};
export function useOrderId(id) {
    const { data, isLoading, error, isSuccess, isFetching } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrderId(id),
        select: (data) => data,
        enabled: !!id
    });
    return { order: data };
}
//# sourceMappingURL=useOrderId.js.map