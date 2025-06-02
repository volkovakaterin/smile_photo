import axios from 'axios';

export const getPeriodCleaner = async () => {
    const res = await axios.get(`/api/globals/period-cleaner`);
    return res.data?.period || null;
};