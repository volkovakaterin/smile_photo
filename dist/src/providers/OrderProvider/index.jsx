'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
export var TYPE_MODE;
(function (TYPE_MODE) {
    TYPE_MODE["EDIT"] = "edit";
    TYPE_MODE["CREAT"] = "create";
})(TYPE_MODE || (TYPE_MODE = {}));
const OrderContext = createContext(undefined);
export const OrderProvider = ({ children }) => {
    const [orderId, setOrderId] = useState(null);
    const [basketProducts, setBasketProducts] = useState(null);
    const [quantityProducts, setQuantityProducts] = useState(0);
    const [mode, setMode] = useState(TYPE_MODE.CREAT);
    const [directories, setDirectories] = useState({ photos: '' });
    const [formatForAll, setFormatForAll] = useState([]);
    const url = process.env.NEXT_PUBLIC_SERVER_URL;
    const resetOrder = () => {
        setOrderId(null);
        setBasketProducts(null);
        setQuantityProducts(0);
        setMode(TYPE_MODE.CREAT);
        setFormatForAll([]);
    };
    const handleSetFormatForAll = (id, label) => {
        let newArr = [...formatForAll];
        const exists = newArr.some(item => item.id === id);
        if (exists) {
            newArr = newArr.filter(item => item.id !== id);
        }
        else {
            newArr.push({ id, label });
        }
        setFormatForAll(newArr);
    };
    useEffect(() => {
        const fetchDirectories = async () => {
            try {
                const response = await axios.get(`${url}/api/directories`);
                const photos = response.data.docs.find((item) => item.service_name === 'photo_directory')?.path || '';
                setDirectories({ photos });
            }
            catch (error) {
                console.error('Failed to fetch directories:', error);
            }
        };
        fetchDirectories();
    }, []);
    return (<OrderContext.Provider value={{
            orderId, setOrderId, basketProducts, setBasketProducts,
            quantityProducts, setQuantityProducts, mode, setMode, directories,
            setDirectories, resetOrder, formatForAll, setFormatForAll, handleSetFormatForAll
        }}>
            {children}
        </OrderContext.Provider>);
};
export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
//# sourceMappingURL=index.jsx.map