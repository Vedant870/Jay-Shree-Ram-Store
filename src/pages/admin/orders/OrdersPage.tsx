import React from 'react';
import OrdersTable from '../../../components/admin/OrdersTable';

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
        <p className="text-zinc-400">View and manage all customer orders</p>
      </div>

      <OrdersTable />
    </div>
  );
}