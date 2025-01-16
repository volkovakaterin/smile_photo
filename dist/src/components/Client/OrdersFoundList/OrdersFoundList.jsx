'use client';
import React, { useEffect, useState } from 'react';
import styles from './OrdersFoundList.module.scss';
import { groupOrdersByDate } from '@/services/groupOrdersByDate';
import { TYPE_MODE, useOrder } from '@/providers/OrderProvider';
import { useRouter } from 'next/navigation';
import { formattedTime } from '@/services/formattedTime';
const OrdersFoundList = ({ orders }) => {
    const [ordersForList, setOrdersForList] = useState(null);
    const { orderId, quantityProducts, basketProducts, setBasketProducts, setQuantityProducts, setOrderId, setMode } = useOrder();
    const router = useRouter();
    useEffect(() => {
        setOrdersForList(groupOrdersByDate(orders));
    }, [orders]);
    const goToOrder = (id) => {
        setOrderId(id);
        setMode(TYPE_MODE.EDIT);
        router.push(`/edit-order`);
    };
    return (<ul className={styles.OrdersFoundList}>
            {ordersForList && (ordersForList.map((date, index) => (<li className={styles.wrapperDate} key={index}>
                    <span className={styles.date}>{date.date}</span>
                    <ul className={styles.listOrders}>
                        {date.orders.map((order, index) => (<div key={index} onClick={() => goToOrder(order.id)}>
                                <li className={styles.wrapperOrder}>
                                    <span className={styles.tel}>{order.tel_number}</span>
                                    <span className={styles.time}>{formattedTime(order.createdAt)}</span>
                                </li>
                            </div>))}
                    </ul>
                </li>)))}

        </ul>);
};
export default OrdersFoundList;
//# sourceMappingURL=OrdersFoundList.jsx.map