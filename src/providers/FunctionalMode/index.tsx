
import { getFunctionalMode } from '@/requests/getFunctionalMode';
import { createContext, useContext, useEffect, useState } from 'react';


interface FunctionalModeContextProps {
    mode: string;
    setMode: (mode: string) => void;
}

const FunctionalModeContext = createContext<FunctionalModeContextProps | undefined>(undefined);

export const FunctionalModeProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<string>('with_formats');

    useEffect(() => {
        const fetchMode = async () => {
            const functionalMode = await getFunctionalMode();
            setMode(functionalMode);
        };

        fetchMode();
    }, []);

    return (
        <FunctionalModeContext.Provider value={{ mode, setMode }}>
            {children}
        </FunctionalModeContext.Provider>
    );
};

export const useFunctionalMode = () => {
    const context = useContext(FunctionalModeContext);
    if (!context) {
        throw new Error('useFunctionalMode must be used within FunctionalModeProvider');
    }
    return context;
};
