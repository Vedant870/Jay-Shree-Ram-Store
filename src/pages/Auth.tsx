import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Lock, Mail, Eye, EyeOff, UserPlus } from 'lucide-react';
import { apiClient } from '../lib/api.ts';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isLogin) {
        response = await apiClient.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await apiClient.register(formData);
      }

      // Navigate based on user role
      const role = response.admin?.role || response.user?.role;
      const isAdmin = role === 'super_admin' || role === 'admin';
      navigate(isAdmin ? '/admin' : '/catalog');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-10 bg-paper">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white p-12 rounded-[40px] border border-slate-100 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-saffron/10 rounded-full blur-2xl"></div>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-saffron rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-saffron/20 rotate-3">
            {isLogin ? <Lock size={28} className="text-white" /> : <UserPlus size={28} className="text-white" />}
          </div>
          <h2 className="text-4xl font-serif font-bold italic text-slate-800 mb-3">
            {isLogin ? 'Partner Portal' : 'Join as Partner'}
          </h2>
          <p className="text-slate-500 text-sm mb-12 leading-relaxed px-10">
            {isLogin
              ? 'Secure access for authorized retail partners of Jay Shree Ram Distributors.'
              : 'Register as a new business partner to access our wholesale catalog.'
            }
          </p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Full Name / Shop Name</p>
                <div className="relative">
                  <input
                    required={!isLogin}
                    type="text"
                    name="name"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <User className="absolute left-4 top-4 text-slate-400" size={18} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Email Address</p>
              <div className="relative">
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Password</p>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Phone Number</p>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    <span className="absolute left-4 top-4 text-slate-400 font-bold">📱</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Address</p>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                      placeholder="Shop address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    <span className="absolute left-4 top-4 text-slate-400 font-bold">🏪</span>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-4 bg-saffron text-white py-4 rounded-full font-bold hover:bg-orange-500 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'REGISTER')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-saffron font-bold text-sm hover:underline"
            >
              {isLogin ? 'New partner? Register here' : 'Already have account? Sign in'}
            </button>
          </div>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">
              <span className="bg-white px-6">Secure Database Backend</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              Admin access automatically granted for vedantkasaudhan0@gmail.com
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
