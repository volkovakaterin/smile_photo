import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
const url = process.env.NEXT_PUBLIC_SERVER_URL;
export const createOrder = async (orderData) => {
    const response = await axios.post(`${url}/api/orders`, orderData);
    return response.data;
};
export function useCreateOrder() {
    const { mutate, isPending, isError, isSuccess, data } = useMutation({
        mutationKey: ['add order'],
        mutationFn: createOrder,
    });
    return { mutate, isPending, isError, isSuccess, data };
}
//# sourceMappingURL=useCreateOrder.js.map