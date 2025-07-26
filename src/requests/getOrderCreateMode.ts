import axios from 'axios';

export const getOrderCreateMode = async () => {
    const res = await axios.get(`/api/globals/order-creation-mode`);
    return res.data?.mode || 'create_order_number';
};
