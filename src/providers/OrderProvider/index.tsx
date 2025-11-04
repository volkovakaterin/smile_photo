'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface Folder {
    name: string;
    path: string;
    id?: string;
    with_photo?: boolean;
}

interface OrderContextType {
    orderId: string | null;
    setOrderId: (id: string | null) => void;
    basketProducts: [] | null;
    setBasketProducts: (products: any) => void;
    quantityProducts: number;
    setQuantityProducts: (quantity: number) => void;
    mode: string;
    setMode: (value: TYPE_MODE) => void;
    directories: { photos: string };
    setDirectories: (value: { photos: string }) => void;
    resetOrder: () => void;
    formatForAll: { id: string, label: string }[],
    setFormatForAll: (format: { id: string, label: string }[] | []) => void;
    handleSetFormatForAll: (id: string, label: string) => void;
    lastFolder: Folder[];
    setLastFolder: React.Dispatch<React.SetStateAction<Folder[]>>;
    currentPath: string;
    setCurrentPath: (path: string) => void;
}

export enum TYPE_MODE {
    EDIT = 'edit',
    CREAT = 'create'
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
    const [orderId, setOrderId] = useState<string | null>(null);
    const [basketProducts, setBasketProducts] = useState<[] | null>(null);
    const [quantityProducts, setQuantityProducts] = useState(0);
    const [mode, setMode] = useState(TYPE_MODE.CREAT);
    const [directories, setDirectories] = useState({ photos: '' });
    const [formatForAll, setFormatForAll] = useState<{ id: string, label: string }[]>([]);
    const [lastFolder, setLastFolder] = useState<Folder[]>([{
        name: 'Все папки',
        path: '',
    }]);
    const [currentPath, setCurrentPath] = useState('');

    const resetOrder = () => {
        setOrderId(null);
        setBasketProducts(null);
        setQuantityProducts(0);
        setMode(TYPE_MODE.CREAT);
        setFormatForAll([]);
        setLastFolder([{
            name: 'Все папки',
            path: '',
        }]);
        setCurrentPath('');
    };

    const handleSetFormatForAll = (id: string, label: string) => {
        let newArr = [...formatForAll];
        const exists = newArr.some(item => item.id === id);

        if (exists) {
            newArr = newArr.filter(item => item.id !== id);
        } else {
            newArr.push({ id, label });
        }
        setFormatForAll(newArr);
    };


    useEffect(() => {
        const fetchDirectories = async () => {
            try {
                const response = await axios.get(`/api/directories`);
                const photos = response.data.docs.find((item: any) => item.service_name === 'photo_directory')?.path || '';
                setDirectories({ photos });
            } catch (error) {
                console.error('Failed to fetch directories:', error);
            }
        };

        fetchDirectories();
    }, []);



    return (
        <OrderContext.Provider value={{
            orderId, setOrderId, basketProducts, setBasketProducts,
            quantityProducts, setQuantityProducts, mode, setMode, directories,
            setDirectories, resetOrder, formatForAll, setFormatForAll, handleSetFormatForAll, lastFolder, setLastFolder,
            setCurrentPath, currentPath
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
