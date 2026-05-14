import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all admin-related data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("auth_token");

    // Force navigation to auth page
    window.location.href = "/auth";
  };

  const adminData = localStorage.getItem("adminData");
  const admin = adminData ? JSON.parse(adminData) : null;

  return (
    <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-white">
          Admin Dashboard
        </h2>
        {admin && (
          <div className="flex items-center gap-2 text-zinc-400">
            <User size={16} />
            <span className="text-sm">{admin.name}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}