"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Package
} from 'lucide-react';
import { apiClient } from '../../lib/api';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  monthlyGrowth: number;
}

export default function DashboardCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();

    const refreshOnFocus = () => {
      fetchDashboardStats();
    };

    const intervalId = window.setInterval(refreshOnFocus, 30000);
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, []);

  const fetchDashboardStats = async () => {
    setErrorMessage(null);

    try {
      const response = await apiClient.getAnalyticsOverview();
      const overview = response.data || response;
      setStats({
        totalOrders: overview.orders?.total || 0,
        totalRevenue: overview.revenue?.total || 0,
        pendingOrders: overview.orders?.placed || 0,
        deliveredOrders: overview.orders?.delivered || 0,
        totalProducts: overview.totalProducts || 0,
        monthlyGrowth: overview.monthlyGrowth || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setErrorMessage('Unable to load synced dashboard data right now. Please refresh after login/server reconnect.');
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalProducts: 0,
        monthlyGrowth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Delivered Orders",
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Monthly Growth",
      value: `+${stats.monthlyGrowth}%`,
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 animate-pulse">
            <div className="h-4 bg-zinc-700 rounded mb-4"></div>
            <div className="h-8 bg-zinc-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="text-right">
                  <h3 className="text-zinc-400 text-sm font-medium">
                    {card.title}
                  </h3>
                </div>
              </div>

              <div className="text-3xl font-bold text-white mb-1">
                {card.value}
              </div>

              <div className="text-zinc-500 text-sm">
                {card.title === "Monthly Growth" ? "vs last month" : "Total count"}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
