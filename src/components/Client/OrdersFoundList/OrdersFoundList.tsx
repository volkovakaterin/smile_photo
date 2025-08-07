'use client';

import React, { useEffect, useState } from 'react';
import styles from './OrdersFoundList.module.scss';
import { groupOrdersByDate } from '@/services/groupOrdersByDate';
import { TYPE_MODE, useOrder } from '@/providers/OrderProvider';
import { useRouter } from 'next/navigation';
import { formattedTime } from '@/services/formattedTime';

type Product = {
    id: string;
    product: string;
    label: string;
    quantity: number;
    done: boolean;
};

type Image = {
    id: string;
    image: string;
    products: Product[];
};

export type Order = {
    id: string;
    tel_number: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    images: Image[];
    folder_name?: string;
};

type GroupedOrders = {
    date: string;
    orders: Order[];
};

type OrdersFoundListProps = {
    orders: Order[]
}

const OrdersFoundList = ({ orders }: OrdersFoundListProps) => {
    const [ordersForList, setOrdersForList] = useState<GroupedOrders[] | null>(null);
    const { orderId, quantityProducts, basketProducts, setBasketProducts, setQuantityProducts, setOrderId, setMode } = useOrder();
    const router = useRouter();

    useEffect(() => {
        setOrdersForList(groupOrdersByDate(orders));
    }, [orders])

    const goToOrder = (id) => {
        setOrderId(id)
        setMode(TYPE_MODE.EDIT)
        router.push(`/edit-order`)
    }

    return (
        <ul className={styles.OrdersFoundList}>
            {ordersForList && (ordersForList.map((date, index) => (
                <li className={styles.wrapperDate} key={index}>
                    <span className={styles.date}>{date.date}</span>
                    <ul className={styles.listOrders}>
                        {date.orders.map((order, index) => (
                            <div key={index} onClick={() => goToOrder(order.id)}>
                                <li className={styles.wrapperOrder} >
                                    <span className={styles.tel}>{order.tel_number || order.folder_name}</span>
                                    <span className={styles.time}>{formattedTime(order.createdAt)}</span>
                                </li>
                            </div>
                        ))}
                    </ul>
                </li>
            )))}

        </ul>
    );
};

export default OrdersFoundList;
