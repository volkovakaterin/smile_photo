'use client'
import React, { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/Order/useGetOrders';
import FilterByStatus from '@/components/Client/FilterOrders/FilterOrders';
import OrdersTable from '@/components/Client/OrdersTable/OrdersTable';



export type SuperAdminType = {}


const SuperAdmin = () => {
    const [filterStatus, setFilterStatus] = useState<string | undefined>();
    const { orders } = useOrders(filterStatus);

    return (
        <div>
            <h4>Все заказы</h4>
            <FilterByStatus currentStatus={filterStatus} onStatusChange={setFilterStatus} />
            {orders && <OrdersTable orders={orders.docs} />}
        </div>
    );
};

export default SuperAdmin;
