import axios from 'axios';

export const getPeriodMonitoring = async (): Promise<number> => {
    try {
        const res = await axios.get<{ period?: number }>(
            'http://localhost:3000/api/globals/period-monitoring'
        );
        const period = res.data.period;
        if (typeof period === 'number' && period > 0) {
            return period;
        }
    } catch (e) {
        console.error('Не удалось получить period-monitoring:', e);
    }
    return 5; // дефолт
};



