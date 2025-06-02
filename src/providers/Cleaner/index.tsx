
import { getPeriodCleaner } from '@/requests/getPeriodCleaner';
import { createContext, useContext, useEffect, useState } from 'react';


interface CleanerContextProps {
    period: number;
    setPeriod: (period: number) => void;
}

const CleanerContext = createContext<CleanerContextProps | undefined>(undefined);

export const CleanerProvider = ({ children }: { children: React.ReactNode }) => {
    const [period, setPeriod] = useState<number>(0);

    useEffect(() => {
        const fetchperiod = async () => {
            const cleaner = await getPeriodCleaner();
            setPeriod(cleaner);
        };

        fetchperiod();
    }, []);

    return (
        <CleanerContext.Provider value={{ period, setPeriod }}>
            {children}
        </CleanerContext.Provider>
    );
};

export const useCleaner = () => {
    const context = useContext(CleanerContext);
    if (!context) {
        throw new Error('useCleaner must be used within CleanerProvider');
    }
    return context;
};
