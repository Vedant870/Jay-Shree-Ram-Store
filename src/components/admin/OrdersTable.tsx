"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Printer, Eye } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface Order {
  id?: string;
  _id: string;
  orderNumber?: string;
  customerName?: string;
  phone?: string;
  address?: string;
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
  status: 'placed' | 'packed' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getOrderId = (order: Order) => order._id || order.id || '';
  const getCustomerName = (order: Order) => order.customer?.name || order.customerName || 'Customer';
  const getCustomerPhone = (order: Order) => order.customer?.phone || order.phone || '—';
  const getCustomerAddress = (order: Order) => order.address || '—';

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
      const rows = response.orders || response;
      setOrders(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      setErrorMessage('Unable to load synced orders right now. Please retry after server/database reconnect.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(orderId);
    setErrorMessage(null);

    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      if (selectedOrder && getOrderId(selectedOrder) === orderId) {
        const fresh = orders.find((o) => getOrderId(o) === orderId);
        if (fresh) setSelectedOrder({ ...fresh, status: newStatus });
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      setErrorMessage(error?.message || 'Unable to update order status right now.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'packed':
        return 'bg-blue-500/20 text-blue-400';
      case 'out-for-delivery':
        return 'bg-orange-500/20 text-orange-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Clock size={14} />;
      case 'delivered':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const printOrder = (order: Order) => {
    const totalQty = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const itemsRows = order.items
      .map(
        (item, idx) => `
          <tr>
            <td style="padding:8px;border:1px solid #ccc;">${idx + 1}</td>
            <td style="padding:8px;border:1px solid #ccc;">${item.name}</td>
            <td style="padding:8px;border:1px solid #ccc;text-align:right;">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #ccc;text-align:right;">₹${Number(item.price).toLocaleString()}</td>
            <td style="padding:8px;border:1px solid #ccc;text-align:right;">₹${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
          </tr>
        `
      )
      .join('');

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    win.document.write(`
      <html>
      <head>
        <title>Order #${order.orderNumber || getOrderId(order).slice(-6)}</title>
      </head>
      <body style="font-family:Arial,sans-serif;padding:24px;color:#111;">
        <h2 style="margin:0 0 6px;">Jay Shree Ram Distributors</h2>
        <p style="margin:0 0 14px;color:#555;">Printable Order Sheet</p>
        <hr/>
        <p><b>Order No:</b> ${order.orderNumber || getOrderId(order).slice(-6)}</p>
        <p><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><b>Status:</b> ${order.status}</p>
        <p><b>Customer:</b> ${getCustomerName(order)}</p>
        <p><b>Phone:</b> ${getCustomerPhone(order)}</p>
        <p><b>Address:</b> ${getCustomerAddress(order)}</p>
        <p><b>Route:</b> ${order.route || 'Local'}</p>
        <br/>
        <table style="border-collapse:collapse;width:100%;font-size:13px;">
          <thead>
            <tr style="background:#f4f4f4;">
              <th style="padding:8px;border:1px solid #ccc;">#</th>
              <th style="padding:8px;border:1px solid #ccc;text-align:left;">Item</th>
              <th style="padding:8px;border:1px solid #ccc;text-align:right;">Qty</th>
              <th style="padding:8px;border:1px solid #ccc;text-align:right;">Rate</th>
              <th style="padding:8px;border:1px solid #ccc;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <p style="margin-top:14px;"><b>Total Qty:</b> ${totalQty}</p>
        <p style="margin-top:6px;font-size:18px;"><b>Grand Total: ₹${Number(order.totalAmount || 0).toLocaleString()}</b></p>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const selectedOrderTotalQty = useMemo(
    () => (selectedOrder ? selectedOrder.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0),
    [selectedOrder]
  );

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {errorMessage && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{errorMessage}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Incoming Orders List</h2>
            <button onClick={fetchOrders} className="text-zinc-400 hover:text-white transition-colors">
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
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const oid = getOrderId(order);
                  return (
                    <tr key={oid} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">
                        <div className="space-y-1">
                          <div>#{order.orderNumber || oid.slice(-6)}</div>
                          <div className="text-xs text-zinc-500">ID: {oid.slice(-8)}</div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-medium">{getCustomerName(order)}</div>
                          <div className="text-zinc-500 text-xs">Phone: {getCustomerPhone(order)}</div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-zinc-300">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>

                      <td className="py-4 px-4 text-white font-semibold">₹{Number(order.totalAmount || 0).toLocaleString()}</td>

                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(oid, e.target.value as Order['status'])}
                          disabled={updatingStatus === oid}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(order.status)} bg-transparent`}
                        >
                          <option value="placed">Placed</option>
                          <option value="packed">Packed</option>
                          <option value="out-for-delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-zinc-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center gap-1 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:border-white">
                            <Eye size={12} /> View
                          </button>
                          <button onClick={() => printOrder(order)} className="inline-flex items-center gap-1 rounded-full bg-saffron px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-saffron/90">
                            <Printer size={12} /> Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && <div className="text-center py-12 text-zinc-400">No orders found</div>}
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">Print Preview</h3>

          {!selectedOrder ? (
            <p className="text-zinc-400 text-sm">Select an order from list to preview printable details.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <p className="text-zinc-500">Order No</p>
                <p className="text-white font-semibold">#{selectedOrder.orderNumber || getOrderId(selectedOrder).slice(-6)}</p>
                <p className="text-zinc-500 mt-2">Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 mt-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span>{selectedOrder.status}</span>
                </div>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-1">
                <p className="text-white font-medium">{getCustomerName(selectedOrder)}</p>
                <p className="text-zinc-400">Phone: {getCustomerPhone(selectedOrder)}</p>
                <p className="text-zinc-400">Address: {getCustomerAddress(selectedOrder)}</p>
                <p className="text-zinc-400">Route: {selectedOrder.route || 'Local'}</p>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <p className="text-zinc-400 mb-2">Items</p>
                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex items-center justify-between text-zinc-200">
                      <span className="max-w-[70%] truncate">{item.name} × {item.quantity}</span>
                      <span>₹{(Number(item.price) * Number(item.quantity)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-800 text-zinc-300">Total Qty: {selectedOrderTotalQty}</div>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <p className="text-zinc-500">Grand Total</p>
                <p className="text-2xl font-bold text-white">₹{Number(selectedOrder.totalAmount || 0).toLocaleString()}</p>
              </div>

              <button onClick={() => printOrder(selectedOrder)} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-4 py-2.5 font-semibold text-slate-950 hover:bg-saffron/90">
                <Printer size={16} /> Print This Order
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

