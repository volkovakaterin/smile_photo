
import { createContext, useContext, useEffect, useState } from 'react';


interface SearchByPhoneOrFolderContextProps {
    searhByPhoneOrFolder: { phone?: string; nameFolder?: string } | null;
    setSearchByPhoneOrFolder: (orderName: { phone?: string; nameFolder?: string } | null) => void;
}

const SearchByPhoneOrFolderContext = createContext<SearchByPhoneOrFolderContextProps | undefined>(undefined);

export const SearchByPhoneOrFolderProvider = ({ children }: { children: React.ReactNode }) => {
    const [searhByPhoneOrFolder, setSearchByPhoneOrFolder] = useState<{ phone?: string; nameFolder?: string } | null>(null);

    return (
        <SearchByPhoneOrFolderContext.Provider value={{ searhByPhoneOrFolder, setSearchByPhoneOrFolder }}>
            {children}
        </SearchByPhoneOrFolderContext.Provider>
    );
};

export const useSearchByPhoneOrFolder = () => {
    const context = useContext(SearchByPhoneOrFolderContext);
    if (!context) {
        throw new Error('useSearchByPhoneOrFolder must be used within SearchByPhoneOrFolderProvider');
    }
    return context;
};
