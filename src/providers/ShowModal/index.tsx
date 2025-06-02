
import { createContext, useContext, useState } from 'react';


interface ShowModalGlobalContextProps {
    showModalGlobal: boolean;
    setShowModalGlobal: (status: boolean) => void;
}

const ShowModalGlobalContext = createContext<ShowModalGlobalContextProps | undefined>(undefined);

export const ShowModalGlobalProvider = ({ children }: { children: React.ReactNode }) => {
    const [showModalGlobal, setShowModalGlobal] = useState<boolean>(false);

    return (
        <ShowModalGlobalContext.Provider value={{ showModalGlobal, setShowModalGlobal }}>
            {children}
        </ShowModalGlobalContext.Provider>
    );
};

export const useShowModalGlobal = () => {
    const context = useContext(ShowModalGlobalContext);
    if (!context) {
        throw new Error('useShowModalGlobal must be used within ShowModalGlobalProvider');
    }
    return context;
};