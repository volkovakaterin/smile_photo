import axios from 'axios';

export const getFunctionalMode = async () => {
    const res = await axios.get(`/api/globals/functional-mode`);
    return res.data?.mode || 'without_formats';
};
