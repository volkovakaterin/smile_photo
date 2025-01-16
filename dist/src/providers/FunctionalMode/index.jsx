import { getFunctionalMode } from '@/requests/getFunctionalMode';
import { createContext, useContext, useEffect, useState } from 'react';
const FunctionalModeContext = createContext(undefined);
export const FunctionalModeProvider = ({ children }) => {
    const [mode, setMode] = useState('with_formats');
    useEffect(() => {
        const fetchMode = async () => {
            const functionalMode = await getFunctionalMode();
            setMode(functionalMode);
        };
        fetchMode();
    }, []);
    return (<FunctionalModeContext.Provider value={{ mode, setMode }}>
            {children}
        </FunctionalModeContext.Provider>);
};
export const useFunctionalMode = () => {
    const context = useContext(FunctionalModeContext);
    if (!context) {
        throw new Error('useFunctionalMode must be used within FunctionalModeProvider');
    }
    return context;
};
//# sourceMappingURL=index.jsx.map