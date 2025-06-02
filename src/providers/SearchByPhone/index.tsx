
import { createContext, useContext, useEffect, useState } from 'react';


interface SearchByPhoneContextProps {
    searhByPhone: string;
    setSearchByPhone: (phone: string) => void;
}

const SearchByPhoneContext = createContext<SearchByPhoneContextProps | undefined>(undefined);

export const SearchByPhoneProvider = ({ children }: { children: React.ReactNode }) => {
    const [searhByPhone, setSearchByPhone] = useState<string>('');

    return (
        <SearchByPhoneContext.Provider value={{ searhByPhone, setSearchByPhone }}>
            {children}
        </SearchByPhoneContext.Provider>
    );
};

export const useSearchByPhone = () => {
    const context = useContext(SearchByPhoneContext);
    if (!context) {
        throw new Error('useSearchByPhone must be used within SearchByPhoneProvider');
    }
    return context;
};
