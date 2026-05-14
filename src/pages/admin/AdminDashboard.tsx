import React from 'react';
import DashboardCards from '../../components/admin/DashboardCards';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-zinc-400">Monitor your business performance and manage operations</p>
      </div>

      <DashboardCards />
    </div>
  );
}