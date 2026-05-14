import React from 'react';
import { motion } from 'motion/react';
import { Search, Package, Clock, CheckCircle2, ChevronRight, Calendar, House, RotateCcw } from 'lucide-react';
import { apiClient } from '../lib/api.ts';

export default function Orders() {
  const [orderQuery, setOrderQuery] = React.useState('');
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    try {
      if (orderQuery && orderQuery.trim().length >= 6) {
        const order = await apiClient.getOrder(orderQuery.trim());
        setOrders([order]);
      } else {
        const ordersData = await apiClient.getOrders();
        setOrders(ordersData);
      }
      setSearched(true);
    } catch (error: any) {
      console.error('Order search failed:', error);
      setOrders([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      handleSearch();
    } else {
      setSearched(true);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-600';
      case 'packed':
        return 'bg-orange-100 text-orange-600';
      case 'out-for-delivery':
        return 'bg-purple-100 text-purple-600';
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'placed':
        return 'Order Placed';
      case 'packed':
        return 'Packed & Ready';
      case 'out-for-delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="bg-paper p-10">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="bg-slate-900 rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif font-bold italic mb-4">Track my order</h2>
            <p className="text-slate-400 text-sm max-w-md">Apna **Order Number** (6 digits) enter karein jo aapko checkout ke baad mila tha.</p>

            <form onSubmit={handleSearch} className="mt-10 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter 6-digit Order Number..."
                  className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-saffron/20 transition-all font-medium"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                />
                <Package className="absolute left-5 top-4 text-slate-500" size={20} />
              </div>
              <button
                disabled={loading}
                className="bg-saffron text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search History'}
                {!loading && <ChevronRight size={18} />}
              </button>
            </form>
          </div>
          <div className="absolute right-[-10%] top-[-20%] w-80 h-80 bg-saffron/10 rounded-full blur-3xl"></div>
        </div>

        {searched && (
          <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">Found {orders.length} orders</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Order History</p>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={order.id}
                    className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-slate-50">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-300">
                          <Package size={32} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order No: {order.orderNumber || order.id.slice(0, 6)}</p>
                          <h4 className="text-xl font-bold text-slate-800">₹{order.totalAmount?.toLocaleString()}</h4>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${getStatusColor(order.status)}`}>
                          {order.status === 'delivered' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {getStatusLabel(order.status)}
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Calendar size={12} />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="py-6">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Items Summary</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.map((item: any, idx: number) => (
                          <span key={idx} className="bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 border border-slate-100">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <House size={16} className="text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">
                          Delivery Route: <span className="text-slate-800 font-bold">{order.route || 'Local'}</span>
                        </p>
                      </div>
                      <button className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-saffron shadow-lg shadow-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <RotateCcw size={14} /> Reorder same items
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[50px] border border-slate-100 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mx-auto">
                  <Search size={40} />
                </div>
                <h4 className="text-2xl font-serif italic text-slate-800">No order found</h4>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Iss Order Number pe koi order nahi mila. Check karein ke details sahi hai ya nahi.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
