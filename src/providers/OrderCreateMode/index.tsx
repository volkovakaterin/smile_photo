

import { getOrderCreateMode } from '@/requests/getOrderCreateMode';
import { createContext, useContext, useEffect, useState } from 'react';


interface OrderCreateModeContextProps {
    orderCreateMode: string;
    setMode: (mode: string) => void;
}

const OrderCreateModeContext = createContext<OrderCreateModeContextProps | undefined>(undefined);

export const OrderCreateModeProvider = ({ children }: { children: React.ReactNode }) => {
    const [orderCreateMode, setMode] = useState<string>('with_formats');

    useEffect(() => {
        const fetchMode = async () => {
            const mode = await getOrderCreateMode();
            setMode(mode);
        };

        fetchMode();
    }, []);

    return (
        <OrderCreateModeContext.Provider value={{ orderCreateMode, setMode }}>
            {children}
        </OrderCreateModeContext.Provider>
    );
};

export const useOrderCreateMode = () => {
    const context = useContext(OrderCreateModeContext);
    if (!context) {
        throw new Error('useOrderCreateMode must be used within OrderCreateModeProvider');
    }
    return context;
};
