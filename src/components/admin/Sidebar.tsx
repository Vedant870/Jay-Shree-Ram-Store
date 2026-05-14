"use client";

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-5">
      <h1 className="text-2xl font-bold mb-10 text-saffron">
        Admin Panel
      </h1>

      <div className="space-y-4">
        <Link
          to="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin')
              ? 'bg-saffron text-white'
              : 'hover:text-saffron hover:bg-zinc-800'
          }`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          to="/admin/orders"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/orders')
              ? 'bg-saffron text-white'
              : 'hover:text-saffron hover:bg-zinc-800'
          }`}
        >
          <ShoppingBag size={20} />
          Orders
        </Link>

        <Link
          to="/admin/products"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/products')
              ? 'bg-saffron text-white'
              : 'hover:text-saffron hover:bg-zinc-800'
          }`}
        >
          <Package size={20} />
          Products
        </Link>

        <Link
          to="/admin/analytics"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/admin/analytics')
              ? 'bg-saffron text-white'
              : 'hover:text-saffron hover:bg-zinc-800'
          }`}
        >
          <BarChart3 size={20} />
          Analytics
        </Link>
      </div>
    </div>
  );
}