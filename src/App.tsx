import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, House, Package, LayoutDashboard, MessageSquare, Globe, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase.ts';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Catalog from './pages/Catalog.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import Auth from './pages/Auth.tsx';
import Orders from './pages/Orders.tsx';
import Cart from './pages/Cart.tsx';

import { LanguageProvider, useLanguage } from './contexts/LanguageContext.tsx';
import { CartProvider, useCart } from './contexts/CartContext.tsx';
import { MOCK_PRODUCTS } from './mockData.ts';

const Home = () => {
  const { t } = useLanguage();
  const featuredProducts = MOCK_PRODUCTS.filter(p => p.isFeatured);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-10 py-16">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full w-fit">
            <span className="w-2 h-2 bg-saffron rounded-full"></span>
            <span className="text-[10px] font-bold text-saffron uppercase tracking-widest">200+ shops · 6 routes · live stock</span>
          </div>
          <h1 className="text-7xl font-serif font-bold tracking-tight text-slate-900 leading-[1.1]">
            {t('heroTitle').split(',').map((part, i) => i === 1 ? <span key={i} className="text-saffron italic underline decoration-saffron/30 decoration-4 underline-offset-8"> {part}</span> : part)}
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
            {t('heroSubtitle')}
          </p>
          <div className="flex gap-6">
            <Link to="/catalog" className="bg-saffron text-white px-10 py-5 rounded-3xl font-bold shadow-xl shadow-saffron/20 hover:scale-[1.02] transition-all flex items-center gap-3">
               <ShoppingCart size={20} /> {t('browseStock')}
            </Link>
            <Link to="/orders" className="bg-white border border-slate-200 text-slate-600 px-10 py-5 rounded-3xl font-bold hover:bg-slate-50 transition-all flex items-center gap-3">
               <House size={20} /> {t('trackOrder')}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-slate-100 relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800">{t('todayDeals')}</h3>
              <span className="px-3 py-1 bg-orange-50 text-saffron text-[10px] font-bold rounded-full uppercase tracking-widest">Live</span>
            </div>
            <div className="space-y-6">
               {featuredProducts.length > 0 ? (
                 featuredProducts.slice(0, 3).map(p => (
                   <div key={p.id} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-saffron transition-colors">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">₹{p.offerPrice} <span className="text-slate-300 line-through">₹{p.mrp}</span></p>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                 </div>
               )}
               <Link to="/catalog" className="block text-center py-4 text-saffron font-bold text-sm border-t border-slate-50 mt-10">See full inventory →</Link>
            </div>
          </div>
          <div className="absolute -inset-10 bg-saffron/5 rounded-full blur-3xl -z-10"></div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-10 mt-32">
        {[
          { title: t('realTimeStock'), desc: t('realTimeStockDesc'), icon: Package },
          { title: t('routeDelivery'), desc: t('routeDeliveryDesc'), icon: House },
          { title: t('bestPrice'), desc: t('bestPriceDesc'), icon: CheckCircle2 },
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-orange-50 text-saffron rounded-2xl flex items-center justify-center mb-8">
              <item.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

const Header = ({ user, isAdmin }: { user: any; isAdmin: boolean }) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { count } = useCart();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };
  
  return (
    <header className="h-20 border-b border-orange-50 flex items-center justify-between px-10 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-saffron rounded-xl flex items-center justify-center shadow-lg shadow-saffron/20">
            <span className="text-white font-bold text-xl font-serif">जय</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-serif italic font-bold text-slate-800 leading-none">Jay Shree Ram</h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Distributors</span>
          </div>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-10">
        <nav className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-1.5 border border-slate-100 rounded-full hover:border-saffron transition-all">
               <Globe size={12} className="text-saffron" /> {language}
            </button>
            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 hidden group-hover:block z-50 min-w-[120px]">
               {(['English', 'हिन्दी', 'Hinglish'] as const).map(lang => (
                 <button 
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-colors ${language === lang ? 'text-saffron' : 'text-slate-400'}`}
                 >
                   {lang}
                 </button>
               ))}
            </div>
          </div>
          <Link to="/catalog" className="hover:text-saffron transition-colors">Catalog</Link>
          {isAdmin && <Link to="/admin" className="hover:text-saffron transition-colors text-saffron">Admin Panel</Link>}
          <Link to="/track" className="hover:text-saffron transition-colors">Track Order</Link>
        </nav>

        <div className="flex items-center gap-4 pl-10 border-l border-slate-100">
          <Link to="/cart" className="bg-saffron text-white px-6 py-2.5 rounded-full flex items-center gap-3 shadow-lg shadow-saffron/20 hover:scale-[1.02] transition-all">
            <ShoppingCart size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Cart</span>
            {count > 0 && (
              <span className="bg-white text-saffron text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold px-1">{count}</span>
            )}
          </Link>
          
          {user ? (
            <button 
              onClick={handleLogout}
              className="p-2.5 border border-slate-100 rounded-full text-slate-400 hover:text-red-500 hover:border-red-500 transition-all flex items-center gap-2"
            >
               <User size={20} />
               <span className="text-[8px] font-bold uppercase tracking-widest hidden lg:block">Logout</span>
            </button>
          ) : (
            <Link to="/auth" className="p-2.5 border border-slate-100 rounded-full text-slate-400 hover:text-saffron hover:border-saffron transition-all flex items-center gap-2">
              <User size={20} />
              <span className="text-[8px] font-bold uppercase tracking-widest hidden lg:block">Login</span>
            </Link>
          )}
        </div>
      </div>

      <button className="md:hidden" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 bg-white border-b border-slate-100 px-10 py-8 flex flex-col gap-6 font-bold uppercase tracking-widest text-slate-400 shadow-xl z-40"
          >
            <div className="flex gap-4">
               {(['English', 'हिन्दी', 'Hinglish'] as const).map(lang => (
                 <button 
                  key={lang}
                  onClick={() => { setLanguage(lang); setIsMobileOpen(false); }}
                  className={`px-3 py-1.5 rounded-full text-[8px] border transition-all ${language === lang ? 'bg-saffron text-white border-saffron' : 'border-slate-100 text-slate-400'}`}
                 >
                   {lang}
                 </button>
               ))}
            </div>
            <Link to="/catalog" onClick={() => setIsMobileOpen(false)} className="hover:text-saffron">Catalog</Link>
            <Link to="/track" onClick={() => setIsMobileOpen(false)} className="hover:text-saffron">Track Order</Link>
            {isAdmin && <Link to="/admin" onClick={() => setIsMobileOpen(false)} className="text-saffron">Admin Panel</Link>}
            <Link to="/cart" onClick={() => setIsMobileOpen(false)} className="text-slate-800">My Cart ({count})</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Footer = () => (
  <footer className="h-10 border-t border-slate-100 px-10 flex items-center justify-between bg-white text-[10px] text-slate-400 uppercase tracking-widest font-bold">
    <div className="flex items-center gap-8">
      <span>Design Credits: <span className="text-saffron">Vedant</span></span>
    </div>
    <div className="flex items-center gap-8">
      <span>© 2026 JSR Distributors</span>
      <span className="text-slate-800 cursor-pointer text-xs">Support</span>
    </div>
  </footer>
);

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        const isAdminProfile = userDoc.exists() && userDoc.data()?.role === 'admin';
        const isVedant = u.email === 'vedantkasaudhan0@gmail.com';
        setIsAdmin(isAdminProfile || isVedant);
      } else {
        setIsAdmin(false);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <CartProvider>
        <div className="flex flex-col h-screen bg-paper font-sans selection:bg-saffron/20 overflow-hidden">
          <Header user={user} isAdmin={isAdmin} />
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col">
               <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/track" element={<Orders />} />
                  <Route path="/admin/*" element={isAdmin ? <AdminDashboard /> : <div className="p-20 text-center text-red-500 font-bold">Access Denied. Admins Only.</div>} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/cart" element={<Cart />} />
                </Routes>
               </div>
               <Footer />
            </div>
          </main>
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}
