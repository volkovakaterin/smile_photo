import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';
const url = process.env.NEXT_PUBLIC_SERVER_URL;
export const changeStatusOrder = async (data) => {
    const response = await axios.patch(`${url}/api/orders/${data.id}`, { status: data.status });
    return response.data;
};
export function useChangeStatusOrder() {
    const { mutate, isPending, isError, isSuccess } = useMutation({
        mutationKey: ['change status order'],
        mutationFn: changeStatusOrder,
    });
    return { mutate, isPending, isError, isSuccess };
}
export const useStatusChangeOrder = () => {
    const { mutate: changeStatus } = useChangeStatusOrder();
    const queryClient = useQueryClient();
    const handleChangeStatusOrder = (status, orderId) => {
        if (!orderId) {
            console.error('Заказ не открыт.');
            return;
        }
        changeStatus({ status, id: orderId }, {
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['orders'] });
            },
            onError: (error) => {
                console.error('Ошибка ', error);
            },
        });
    };
    return { handleChangeStatusOrder };
};
//# sourceMappingURL=useChangeStatusOrder.js.map