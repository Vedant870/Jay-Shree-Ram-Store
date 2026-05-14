import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { apiClient } from '../../../lib/api';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    salesTrend: [],
    revenueByCategory: [],
    orderStatus: [],
    topProducts: [],
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    orderSuccessRate: 0,
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.getAnalyticsOverview();
      const data = response.data || response;

      setAnalyticsData({
        salesTrend: data.salesTrend || [],
        revenueByCategory: data.revenueByCategory || [],
        orderStatus: [
          { name: 'Delivered', value: data.orders?.delivered || 0, color: '#10b981' },
          { name: 'Placed', value: data.orders?.placed || 0, color: '#3b82f6' },
          { name: 'Packed', value: data.orders?.packed || 0, color: '#f59e0b' },
          { name: 'Cancelled', value: data.orders?.cancelled || 0, color: '#ef4444' },
        ],
        topProducts: data.topProducts || [],
        totalOrders: data.orders?.total || 0,
        totalRevenue: data.revenue?.total || 0,
        activeCustomers: data.activeCustomers || 0,
        orderSuccessRate: data.orderSuccessRate || 0,
        monthlyGrowth: data.monthlyGrowth || 0,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-zinc-400">Loading analytics data...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 animate-pulse">
              <div className="h-48 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-zinc-400">Comprehensive business insights and performance metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{analyticsData.totalOrders}</h3>
          <p className="text-zinc-400 text-sm">Total Orders</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">{analyticsData.orderSuccessRate}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">₹{analyticsData.totalRevenue.toLocaleString()}</h3>
          <p className="text-zinc-400 text-sm">Total Revenue</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">{analyticsData.monthlyGrowth}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{analyticsData.activeCustomers}</h3>
          <p className="text-zinc-400 text-sm">Active Customers</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">{analyticsData.orderSuccessRate}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white">{analyticsData.orderSuccessRate}%</h3>
          <p className="text-zinc-400 text-sm">Order Success Rate</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">{analyticsData.orderSuccessRate > 0 ? `+${analyticsData.orderSuccessRate}%` : '—'}</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.revenueByCategory}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.orderStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Top Products</h3>
          <div className="space-y-4">
              {analyticsData.topProducts.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-saffron rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-white">{product.name}</span>
                  </div>
                  <span className="text-zinc-400">{(product.sales ?? product.quantity) || 0} sales</span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}