'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface OrderContextType {
    orderId: string | null;
    setOrderId: (id: string | null) => void;
    basketProducts: [] | null;
    setBasketProducts: (products: any) => void;
    quantityProducts: number;
    setQuantityProducts: (quantity: number) => void;
    mode: string;
    setMode: (value: TYPE_MODE) => void;
    directories: { archives: string, photos: string };
    setDirectories: (value: { archives: string, photos: string }) => void;
    resetOrder: () => void;
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
    const [directories, setDirectories] = useState({ archives: '', photos: '' });

    const resetOrder = () => {
        setOrderId(null);
        setBasketProducts(null);
        setQuantityProducts(0);
        setMode(TYPE_MODE.CREAT);
    };

    useEffect(() => {
        const fetchDirectories = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/directories');
                const archives = response.data.docs.find((item: any) => item.service_name === 'archives_directory')?.path || '';
                const photos = response.data.docs.find((item: any) => item.service_name === 'photo_directory')?.path || '';
                setDirectories({ archives, photos });
            } catch (error) {
                console.error('Failed to fetch directories:', error);
            }
        };

        fetchDirectories();
    }, []);

    return (
        <OrderContext.Provider value={{
            orderId, setOrderId, basketProducts, setBasketProducts,
            quantityProducts, setQuantityProducts, mode, setMode, directories, setDirectories, resetOrder
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
