import axios from 'axios';

export const getFunctionalMode = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/globals/functional-mode`);
    return res.data?.mode || 'with_formats';
};
