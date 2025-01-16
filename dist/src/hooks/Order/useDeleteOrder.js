import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';
const url = process.env.NEXT_PUBLIC_SERVER_URL;
export const deleteOrder = async (id) => {
    const response = await axios.delete(`${url}/api/orders/${id}`);
    return response.data;
};
export function useDeleteOrder() {
    const queryClient = useQueryClient();
    const { mutate, isPending, isError, isSuccess, data } = useMutation({
        mutationKey: ['delete order'],
        mutationFn: deleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
    return { mutate, isPending, isError, isSuccess, data };
}
//# sourceMappingURL=useDeleteOrder.js.map