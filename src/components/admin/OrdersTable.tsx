"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface Order {
  id?: string;
  _id: string;
  orderNumber?: string;
  customerName?: string;
  phone?: string;
  route?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'placed' | 'confirmed' | 'packed' | 'preparing' | 'out-for-delivery' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getOrderId = (order: Order) => order._id || order.id || '';

  const getCustomerName = (order: Order) => order.customer?.name || order.customerName || 'Customer';

  const getCustomerPhone = (order: Order) => order.customer?.phone || order.phone || '—';

  useEffect(() => {
    fetchOrders();

    const refreshOrders = () => {
      fetchOrders();
    };

    const intervalId = window.setInterval(refreshOrders, 30000);
    window.addEventListener('focus', refreshOrders);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshOrders);
    };
  }, []);

  const fetchOrders = async () => {
    setErrorMessage(null);

    try {
      const response = await apiClient.getOrders();
      const orders = response.orders || response;
      if (Array.isArray(orders)) {
        setOrders(orders);
      } else {
        console.warn('Unexpected orders response:', response);
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      setErrorMessage('Unable to load synced orders right now. Please retry after server/database reconnect.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    setErrorMessage(null);

    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      // Refresh orders after update
      await fetchOrders();
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      setErrorMessage(error?.message || 'Unable to update order status right now.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-500/20 text-yellow-400';
      case 'packed': return 'bg-blue-500/20 text-blue-400';
      case 'out-for-delivery': return 'bg-orange-500/20 text-orange-400';
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return <Clock size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
    >
      {errorMessage && (
        <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
        <button
          onClick={fetchOrders}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-zinc-400 border-b border-zinc-800">
              <th className="pb-3 px-4">Order ID</th>
              <th className="pb-3 px-4">Customer</th>
              <th className="pb-3 px-4">Items</th>
              <th className="pb-3 px-4">Amount</th>
              <th className="pb-3 px-4">Route</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4">Date</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={getOrderId(order)}
                className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <td className="py-4 px-4 text-white font-medium">
                  <div className="space-y-1">
                    <div>#{order.orderNumber || getOrderId(order).slice(-6)}</div>
                    <div className="text-xs text-zinc-500">ID: {getOrderId(order).slice(-8)}</div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div>
                    <div className="text-white font-medium">{getCustomerName(order)}</div>
                    <div className="text-zinc-400 text-sm">{order.customer?.email || 'guest order'}</div>
                    <div className="text-zinc-500 text-xs">Phone: {getCustomerPhone(order)}</div>
                  </div>
                </td>

                <td className="py-4 px-4 text-zinc-300">
                  <div className="space-y-1">
                    <div>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                    <div className="text-xs text-zinc-500 max-w-xs">
                      {order.items.slice(0, 3).map((item) => `${item.name} x${item.quantity}`).join(', ')}
                      {order.items.length > 3 ? '...' : ''}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 text-white font-semibold">
                  ₹{order.totalAmount.toLocaleString()}
                </td>

                <td className="py-4 px-4 text-zinc-400 text-sm">
                  {order.route || 'Local'}
                </td>

                <td className="py-4 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(getOrderId(order), e.target.value)}
                    disabled={updatingStatus === getOrderId(order)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                      getStatusColor(order.status)
                    } bg-transparent`}
                  >
                    <option value="placed">Placed</option>
                    <option value="packed">Packed</option>
                    <option value="out-for-delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td className="py-4 px-4 text-zinc-400 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="py-4 px-4">
                  <div className="text-zinc-400 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <Eye size={14} />
                      <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} qty</span>
                    </div>
                    <div>{getStatusIcon(order.status)}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No orders found</p>
        </div>
      )}
    </motion.div>
  );
}
