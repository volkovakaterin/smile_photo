'use client';
import React, { useState } from 'react';
import { useOrders } from '@/hooks/Order/useGetOrders';
import FilterByStatus from '@/components/Client/FilterOrders/FilterOrders';
import OrdersTable from '@/components/Client/OrdersTable/OrdersTable';
const SuperAdmin = () => {
    const [filterStatus, setFilterStatus] = useState();
    const { orders } = useOrders(filterStatus);
    return (<div>
            <h4>Все заказы</h4>
            <FilterByStatus currentStatus={filterStatus} onStatusChange={setFilterStatus}/>
            {orders && <OrdersTable orders={orders.docs}/>}
        </div>);
};
export default SuperAdmin;
//# sourceMappingURL=page.jsx.map