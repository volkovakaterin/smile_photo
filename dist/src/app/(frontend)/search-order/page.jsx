'use client';
import React, { useEffect, useState } from 'react';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import styles from './style.module.scss';
import FormSearchOrder from '@/components/Client/FormSearchOrder/FormSearchOrder';
import OrdersFoundList from '@/components/Client/OrdersFoundList/OrdersFoundList';
import { useOrders } from '@/hooks/Order/useGetOrders';
import { useOrder } from '@/providers/OrderProvider';
const SearchOrder = () => {
    const [searhByPhone, setSearchByPhone] = useState();
    const { orders } = useOrders(["open", "created"], searhByPhone);
    const { setOrderId } = useOrder();
    useEffect(() => {
        setOrderId(null);
    }, []);
    return (<div>
            <NavigationBar />
            <div className={styles.SearchOrder}>
                <h2 className={styles.title}>Выберите заказ для редактирования</h2>
                <FormSearchOrder onSearchByPhone={setSearchByPhone}/>
                {searhByPhone ? (orders && orders.docs && orders.docs.length > 0 ? (<OrdersFoundList orders={orders.docs}/>) : (<div className={styles.notOrders}>Заказы не найдены</div>)) : null}
            </div>
        </div>);
};
export default SearchOrder;
//# sourceMappingURL=page.jsx.map