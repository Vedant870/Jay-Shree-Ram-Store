import React, {
  useEffect,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'motion/react';

import {
  BarChart3,
  TrendingUp,
  PieChart,
  Package,
  RefreshCw,
  LogOut
} from 'lucide-react';

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const adminData =
    localStorage.getItem(
      "adminData"
    );

  const admin = adminData
    ? JSON.parse(adminData)
    : null;

  useEffect(() => {

    const token =
      localStorage.getItem(
        "adminToken"
      );

    if (!token) {
      navigate("/auth");
    }

  }, [navigate]);

  const handleLogout = () => {
    // Clear all admin-related data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("auth_token");

    // Force navigation to auth page
    window.location.href = "/auth";
  };

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <RefreshCw className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />

          <p className="text-slate-600">
            Loading dashboard...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[35px] p-8 shadow-sm border border-slate-100 mb-8"
        >

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-4xl font-bold text-slate-800">
                Admin Dashboard
              </h1>

              <p className="text-slate-500 mt-2">
                Welcome back,
                {" "}
                <span className="font-bold">
                  {admin?.name}
                </span>
              </p>

            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-full font-semibold hover:bg-red-600 transition-all"
            >

              <LogOut size={18} />

              Logout

            </button>

          </div>

        </motion.div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* PRODUCTS */}

          <motion.div
            onClick={() => navigate('/admin/products')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100 cursor-pointer hover:scale-[1.02] transition-all"
          >

            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-5">

              <Package
                className="text-orange-500"
                size={28}
              />

            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Products
            </h2>

            <p className="text-slate-500">
              Manage all inventory products
            </p>

          </motion.div>

          {/* SALES */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100"
          >

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">

              <TrendingUp
                className="text-blue-500"
                size={28}
              />

            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Sales
            </h2>

            <p className="text-slate-500">
              Sales and revenue overview
            </p>

          </motion.div>

          {/* ANALYTICS */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100"
          >

            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-5">

              <PieChart
                className="text-green-500"
                size={28}
              />

            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Analytics
            </h2>

            <p className="text-slate-500">
              Business reports and insights
            </p>

          </motion.div>

        </div>

      </div>

    </div>
  );
}