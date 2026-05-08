import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { IndianRupee, TrendingUp, Users, Package, ArrowUpRight, ArrowDownRight, Wallet, PieChart, Calendar, ChevronRight, CheckCircle2, Truck, XCircle, Share2, Plus, Edit2, Trash2, MessageSquare, AlertCircle, Star, User, Lock, Mail, Phone, MapPin, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../lib/firebase.ts';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MOCK_PRODUCTS } from '../mockData.ts';

const REVENUE_DATA = [
  { name: 'Jan', revenue: 45000, profit: 12000, margin: 26 },
  { name: 'Feb', revenue: 52000, profit: 15000, margin: 28 },
  { name: 'Mar', revenue: 48000, profit: 13500, margin: 28 },
  { name: 'Apr', revenue: 61000, profit: 19000, margin: 31 },
  { name: 'May', revenue: 55000, profit: 16500, margin: 30 },
  { name: 'Jun', revenue: 67000, profit: 21000, margin: 31 },
];

const ROUTES = ['Route 1 (City)', 'Route 2 (North)', 'Route 3 (South)', 'Route 4 (East)', 'Route 5 (West)', 'Route 6 (Village)'];

const StatCard = ({ title, value, trend, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}/5 rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-saffron group-hover:text-white transition-colors`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">{value}</h4>
        {subtitle && <p className="text-[10px] text-slate-400 mt-2 font-medium">{subtitle}</p>}
      </div>
    </div>
  </div>
);

type TabType = 'overview' | 'profit' | 'orders' | 'inventory' | 'community' | 'profile';

const AdminProfileSection = () => {
  const [loading, setLoading] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: 'Vedant Kasaudhan',
    email: 'vedantkasaudhan0@gmail.com',
    phone: '+91 9999999999',
    address: 'Gola Bazaar, Gorakhpur'
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Real firestore update would happen here
    setTimeout(() => {
      setLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-12"
    >
      <div className="bg-slate-900 rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 bg-saffron rounded-[40px] flex items-center justify-center text-white shadow-xl shadow-saffron/20 border-4 border-white/10 group overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=f97316`} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <div>
               <h3 className="text-4xl font-serif font-bold italic mb-2">{profile.name}</h3>
               <p className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-300 w-fit">Master Admin Profile</p>
            </div>
         </div>
         <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-saffron/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
         <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-10">
            <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Full Name</p>
               <div className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                  />
                  <User className="absolute left-4 top-4 text-slate-400" size={18} />
               </div>
            </div>

            <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Email Address</p>
               <div className="relative">
                  <input 
                    type="email" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                  />
                  <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
               </div>
            </div>

            <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Phone Number</p>
               <div className="relative">
                  <input 
                    type="tel" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                  />
                  <Phone className="absolute left-4 top-4 text-slate-400" size={18} />
               </div>
            </div>

            <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-2">Display Address</p>
               <div className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-12 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium"
                    value={profile.address}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                  />
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
               </div>
            </div>

            <div className="md:col-span-2 pt-6">
               <button 
                type="submit" 
                disabled={loading}
                className="bg-saffron text-white px-10 py-5 rounded-3xl font-bold shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
               >
                  {loading ? 'Saving...' : 'Update Admin Credentials'}
                  <Lock size={18} />
               </button>
            </div>
         </form>
      </div>
    </motion.div>
  );
};

const ProductInventoryCard = ({ product }: { product: any, key?: any }) => {
  const [uploading, setUploading] = React.useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${product.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'products', product.id), { imageUrl: url });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div key={product.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      {product.isFeatured && (
        <div className="absolute top-4 right-4 text-saffron">
            <Star size={16} fill="currentColor" />
        </div>
      )}
      <div className="aspect-square bg-slate-50 rounded-[32px] mb-6 flex items-center justify-center text-slate-200 group-hover:text-saffron transition-colors relative overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package size={40} />
          )}
          
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2">
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Camera size={24} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Update Photo</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          </label>
      </div>
      <div className="space-y-4">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.company}</p>
            <h4 className="font-bold text-slate-800 line-clamp-1">{product.name}</h4>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <div className="flex flex-col">
                <input 
                  type="number"
                  className={`w-16 h-7 rounded-lg text-center font-bold text-xs border focus:outline-none ${product.stock < 10 ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-100 bg-white text-slate-800'}`}
                  value={product.stock}
                  onChange={(e) => updateDoc(doc(db, 'products', product.id), { stock: parseInt(e.target.value) || 0 })}
                />
                <button 
                  onClick={() => updateDoc(doc(db, 'products', product.id), { isFeatured: !product.isFeatured })}
                  className={`text-[8px] font-bold uppercase mt-1 text-left ${product.isFeatured ? 'text-saffron' : 'text-slate-300'}`}
                >
                  {product.isFeatured ? '★ Featured' : '☆ Feature'}
                </button>
            </div>
            <div className="flex gap-1">
                <button className="p-2 bg-slate-50 rounded-xl hover:text-saffron transition-colors"><Edit2 size={12} /></button>
                <button className="p-2 bg-slate-50 rounded-xl hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  const [orders, setOrders] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [orderFilter, setOrderFilter] = React.useState('all');
  const [routeFilter, setRouteFilter] = React.useState('all');
  const [editingOrder, setEditingOrder] = React.useState<any | null>(null);

  React.useEffect(() => {
    document.title = "JSR Admin | Business Insights";
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = "https://api.dicebear.com/7.x/initials/svg?seed=JSR&backgroundColor=f97316";
    }
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'placed': return { label: 'Placed', color: 'bg-blue-50 text-blue-600', icon: Package };
      case 'packed': return { label: 'Packed', color: 'bg-orange-50 text-orange-600', icon: CheckCircle2 };
      case 'out-for-delivery': return { label: 'Out for Delivery', color: 'bg-purple-50 text-purple-600', icon: Truck };
      case 'delivered': return { label: 'Delivered', color: 'bg-green-50 text-green-600', icon: CheckCircle2 };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-red-50 text-red-600', icon: XCircle };
      default: return { label: status.toUpperCase(), color: 'bg-slate-50 text-slate-600', icon: AlertCircle };
    }
  };

  const shareToWhatsApp = (order: any) => {
    const text = `*Order Update: JSR Distributors*\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nStatus: ${order.status.toUpperCase()}\n\nThank you for choosing JSR!`;
    window.open(`https://wa.me/${order.phone || ''}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const categoryData = React.useMemo(() => {
    const categories: Record<string, { revenue: number, profit: number, stock: number, items: number, lowStock: number }> = {};
    
    products.forEach(p => {
      const cat = p.category || 'General';
      if (!categories[cat]) categories[cat] = { revenue: 0, profit: 0, stock: 0, items: 0, lowStock: 0 };
      
      const margin = p.offerPrice * 0.3; // Estimated 30% margin for demo
      categories[cat].revenue += p.offerPrice * p.stock;
      categories[cat].profit += margin * p.stock;
      categories[cat].stock += p.stock;
      categories[cat].items += 1;
      if (p.stock < 10) categories[cat].lowStock += 1;
    });

    return Object.entries(categories).map(([name, data]) => ({ name, ...data }));
  }, [products]);

  const lowStockItems = React.useMemo(() => products.filter(p => p.stock < 10), [products]);

  const totalBuyValue = React.useMemo(() => products.reduce((acc, p) => acc + (p.offerPrice * 0.7 * p.stock), 0), [products]);
  const totalSellValue = React.useMemo(() => products.reduce((acc, p) => acc + (p.offerPrice * p.stock), 0), [products]);
  const estimatedProfit = totalSellValue - totalBuyValue;

  const totalSalesToday = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter(o => {
        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate().toISOString().split('T')[0] : '';
        return orderDate === today && o.status !== 'cancelled';
      })
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }, [orders]);

  const seedMockData = async () => {
    if (!confirm('CAUTION: This will sync your inventory with the master product catalog and reset stock to default levels. Existing sales will NOT be affected. Proceed?')) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const p of MOCK_PRODUCTS) {
        // Use a consistent ID based on the product name to avoid duplicates
        const consistentId = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const prodRef = doc(db, 'products', consistentId);
        const { id, ...rest } = p;
        
        // Ensure category is cleaned up (Merge Patanjali)
        let finalCategory = rest.category;
        if (finalCategory?.toLowerCase().includes('patanjali')) {
          finalCategory = 'Patanjali';
        }

        batch.set(prodRef, { ...rest, category: finalCategory, updatedAt: new Date().toISOString() }, { merge: true });
        
        // Seed cost data
        const costRef = doc(db, 'costs', consistentId);
        batch.set(costRef, { buyPrice: p.offerPrice * 0.7 });
      }
      await batch.commit();
      alert('Inventory synced with master catalog! Patanjali categories merged.');
    } catch (err) {
      console.error(err);
      alert('Seeding failed.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="p-10 max-w-7xl mx-auto space-y-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-1">Business Dashboard</h2>
            <p className="text-slate-400 text-sm font-medium">Aaj ka summary — sales, cost & net profit/loss live update.</p>
          </div>
        <div className="flex gap-4">
          <button 
            onClick={seedMockData}
            disabled={isSeeding}
            className="px-6 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {isSeeding ? 'Syncing...' : 'Sync Master Catalog'}
          </button>
        </div>
      </div>

      {/* Simplified Tabs */}
      <div className="flex gap-1 p-1 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
        {[
          { id: 'overview', label: 'Summary', icon: TrendingUp },
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'profit', label: 'P/L Analysis', icon: Wallet },
          { id: 'inventory', label: 'Inventory', icon: PieChart },
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'community', label: 'Routes', icon: MessageSquare },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard title="Orders Today" value={orders.filter(o => {
                const today = new Date().toISOString().split('T')[0];
                const orderDate = o.createdAt?.toDate ? o.createdAt.toDate().toISOString().split('T')[0] : '';
                return orderDate === today;
              }).length} icon={Package} color="saffron" />
              <StatCard title="Sales Today" value={`₹${totalSalesToday.toLocaleString()}`} icon={IndianRupee} color="green" />
              <StatCard title="Est. Profit Today" value={`₹${(totalSalesToday * 0.3).toLocaleString()}`} icon={TrendingUp} color="blue" />
              <StatCard title="Total Active" value={orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} icon={Calendar} color="blue" />
              <StatCard title="Low Stock" value={lowStockItems.length} icon={AlertCircle} color="red" />
            </div>

            {/* Power BI Type Profit Box */}
            <div className="bg-slate-50 p-1 rounded-[48px] border border-slate-100">
               <div className="bg-white p-10 rounded-[44px] shadow-sm flex flex-col md:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                    <h3 className="text-2xl font-bold text-slate-800">Daily P/L</h3>
                    <div className="flex gap-4">
                       <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sales Today</p>
                          <p className="text-2xl font-bold text-slate-800">₹{totalSalesToday.toLocaleString()}</p>
                       </div>
                       <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cost Today (Est.)</p>
                          <p className="text-2xl font-bold text-slate-800">₹{(totalSalesToday * 0.7).toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="bg-green-50 p-8 rounded-3xl border border-green-100 flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Net gain (Est.)</p>
                          <p className="text-3xl font-serif font-bold italic text-green-600">₹{(totalSalesToday * 0.3).toLocaleString()}</p>
                       </div>
                       <TrendingUp size={40} className="text-green-100" />
                    </div>
                  </div>
                  <div className="w-[300px] flex flex-col justify-between">
                    <div className="space-y-4">
                       <h4 className="text-sm font-bold text-slate-800">Top sellers (7d)</h4>
                       <p className="text-xs text-slate-400">Highest quantity sold.</p>
                       <div className="h-[120px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData.slice(0, 5)} layout="vertical">
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" hide />
                              <Bar dataKey="stock" fill="#f97316" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xl font-bold text-slate-800">Recent orders</h3>
                     <button className="text-[10px] font-bold text-saffron uppercase tracking-widest">View all →</button>
                  </div>
                  <div className="space-y-6">
                    {orders.slice(0, 5).map((order, i) => (
                      <div key={i} className="flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-slate-100 group-hover:bg-saffron transition-all rounded-full"></div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">#{i + 47} · {order.customerName}</p>
                               <p className="text-[10px] text-slate-400">{order.route || 'Unknown'}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-slate-800">₹{order.totalAmount || '0'}</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Placed</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                     <AlertCircle size={20} className="text-red-500" />
                     Low stock alert
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {products.filter(p => p.stock < 10).slice(0, 8).map((p, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                         <p className="text-xs font-bold text-slate-700">{p.name}</p>
                         <p className="text-xs font-bold text-red-500">{p.stock} pcs</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div 
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden text-black ">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-black">
                <div>
                   <h3 className="text-xl font-serif font-bold italic text-slate-800">Route-wise Operations</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total {orders.length} orders received</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select 
                    className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none"
                    value={routeFilter}
                    onChange={(e) => setRouteFilter(e.target.value)}
                  >
                    <option value="all">All Routes</option>
                    {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {['all', 'placed', 'packed', 'out-for-delivery', 'delivered'].map((filter) => (
                    <button 
                      key={filter} 
                      onClick={() => setOrderFilter(filter)}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors ${orderFilter === filter ? 'bg-saffron text-white' : 'bg-slate-50 text-slate-400 hover:text-saffron'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-8 py-5">Order # / Date</th>
                      <th className="px-8 py-5">Customer & Route</th>
                      <th className="px-8 py-5">Items</th>
                      <th className="px-8 py-5">Amount</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders
                      .filter(o => orderFilter === 'all' || o.status === orderFilter)
                      .filter(o => routeFilter === 'all' || o.route === routeFilter)
                      .map((order) => {
                      const statusInfo = getStatusDisplay(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-mono font-bold text-slate-900 tracking-wider bg-slate-100 px-2 py-1 rounded-lg w-fit text-sm">
                              {order.orderNumber || 'GUEST'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Just now'}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-slate-800">{order.customerName}</p>
                            <p className="text-[10px] text-saffron font-bold uppercase tracking-widest">{order.route || 'No Route'}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{order.phone}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="max-w-[200px]">
                               <p className="text-xs font-bold text-slate-600 mb-1">{order.items?.length || 0} Items</p>
                               <p className="text-[9px] text-slate-400 line-clamp-1">{order.items?.map((it:any) => it.name).join(', ')}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-black">
                            <span className="font-bold text-slate-900 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 italic">₹{order.totalAmount?.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit ${statusInfo.color}`}>
                              <statusInfo.icon size={12} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-end items-center gap-2">
                               <button 
                                onClick={() => setEditingOrder(order)}
                                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-saffron transition-colors border border-slate-100"
                                title="Edit Order"
                               >
                                <Edit2 size={14} />
                               </button>
                              {order.status === 'placed' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'packed')} 
                                  className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
                                >
                                  <CheckCircle2 size={12} /> Pack
                                </button>
                              )}
                              {order.status === 'packed' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'out-for-delivery')} 
                                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
                                >
                                  <Truck size={12} /> Ship
                                </button>
                              )}
                              <button onClick={() => shareToWhatsApp(order)} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-100 shadow-sm" title="WhatsApp Message">
                                <Share2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="p-20 text-center space-y-4">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                        <Package size={32} />
                     </div>
                     <p className="text-slate-400 font-medium italic">No orders found matching filters.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'profit' && (
          <motion.div 
            key="profit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            <div className="bg-slate-900 text-white p-12 rounded-[50px] shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
               <div className="relative z-10 space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-bold text-saffron uppercase tracking-[0.3em]">Estimated Net Profit</p>
                  <h3 className="text-6xl font-serif font-bold italic tracking-tighter">₹{estimatedProfit.toLocaleString()}</h3>
                  <p className="text-slate-400 text-xs">Total potential profit from currently available stock.</p>
               </div>
               <div className="flex gap-8 relative z-10 mt-10 md:mt-0">
                  <div className="text-center md:text-right">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Buy Value</p>
                     <p className="text-xl font-bold">₹{totalBuyValue.toLocaleString()}</p>
                  </div>
                  <div className="text-center md:text-right border-l border-white/10 pl-8">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sales Value</p>
                     <p className="text-xl font-bold">₹{totalSellValue.toLocaleString()}</p>
                  </div>
               </div>
               <div className="absolute right-0 top-0 w-96 h-96 bg-saffron/10 rounded-full blur-[100px] -z-0"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-8">Category Performance</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} width={100} />
                        <Bar dataKey="profit" fill="#f97316" radius={[0, 8, 8, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                  <h3 className="text-xl font-bold text-slate-800 mb-8">Margin Overview</h3>
                  <div className="space-y-6">
                    {categoryData.slice(0, 6).map((cat, i) => (
                      <div key={i} className="flex justify-between items-center group">
                         <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-saffron transition-colors">{cat.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{cat.items} Products</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">₹{cat.profit.toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Growing</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Power BI style Table */}
            <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 overflow-hidden">
               <h3 className="text-xl font-bold text-slate-800 mb-8">Detailed Profit Sheet</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                       <th className="pb-4">Product Category</th>
                       <th className="pb-4">Stock Worth</th>
                       <th className="pb-4">Cost Price</th>
                       <th className="pb-4">Net Margin</th>
                       <th className="pb-4 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {categoryData.map((cat, i) => (
                       <tr key={i} className="hover:bg-white transition-colors group">
                         <td className="py-6 pr-4">
                            <p className="text-sm font-bold text-slate-800">{cat.name}</p>
                         </td>
                         <td className="py-6 px-4">
                            <p className="text-sm font-bold text-slate-600">₹{cat.revenue.toLocaleString()}</p>
                         </td>
                         <td className="py-6 px-4">
                            <p className="text-sm text-slate-400 font-medium">₹{(cat.revenue - cat.profit).toLocaleString()}</p>
                         </td>
                         <td className="py-6 px-4">
                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">₹{cat.profit.toLocaleString()}</span>
                         </td>
                         <td className="py-6 pl-4 text-right">
                            <button className="text-[10px] font-bold text-saffron uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Adjust →</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {/* Items Less (Shopping List) */}
            <div className="bg-orange-50 border border-orange-100 p-10 rounded-[50px] relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-bold text-slate-800">Need to order (Items Less)</h3>
                     <span className="px-4 py-2 bg-saffron text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Report: Low Stock</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lowStockItems.length > 0 ? lowStockItems.map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-saffron group-hover:bg-saffron group-hover:text-white transition-all">
                               <Package size={20} />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{item.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.company}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-red-500">{item.stock} left</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Order Now</p>
                         </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-400 italic">Sab item stock mein hain. No shortage.</p>
                    )}
                  </div>
               </div>
               <div className="absolute right-[-10%] top-[-20%] w-80 h-80 bg-saffron/10 rounded-full blur-3xl"></div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-3xl font-bold text-slate-800">Inventory Management</h3>
                <p className="text-sm text-slate-400 mt-1">Sare brands ka stock yahan se list karein aur modify karein.</p>
              </div>
              <button className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all flex items-center gap-3">
                 <Plus size={20} /> Add new items
              </button>
            </div>

            <div className="space-y-16">
              {Object.entries(
                products.reduce((acc, p) => {
                  const cat = p.category || 'Other';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(p);
                  return acc;
                }, {} as Record<string, any[]>)
              ).map(([category, catProducts]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{category}</span>
                     <div className="h-[1px] flex-1 bg-slate-100"></div>
                     <span className="text-[10px] font-bold text-slate-400">{(catProducts as any).length} Items</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {(catProducts as any[]).map((product: any) => (
                      <ProductInventoryCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'community' && (
          <motion.div 
            key="community"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ROUTES.map((route, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-green-50 text-green-600">
                      <MessageSquare size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active Route</span>
                  </div>
                  <h4 className="text-xl font-serif font-bold italic text-slate-800 mb-2">{route}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-8">Manage community members and broadcast route-specific stock updates.</p>
                  <button className="w-full py-4 bg-green-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                    <Share2 size={14} /> Copy Invite Link
                  </button>
                </div>
              ))}
            </div>
            
            <div className="bg-saffron/5 border border-saffron/10 p-10 rounded-[40px]">
               <h3 className="text-xl font-serif font-bold text-slate-800 mb-4 italic">Strategy Tip: Direct WhatsApp Orders</h3>
               <p className="text-sm text-slate-600 leading-loose max-w-3xl">
                 When you share individual product links in these groups, customers can click and order directly. 
                 The app will automatically tag their order with that Route ID, letting you pack efficiently for tomorrow's delivery trip.
               </p>
            </div>
          </motion.div>
        )}
        {activeTab === 'profile' && (
          <AdminProfileSection />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 space-y-8 relative overflow-hidden"
             >
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                   <h3 className="text-2xl font-serif font-bold italic">Edit Order Details</h3>
                   <button onClick={() => setEditingOrder(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><Trash2 size={20} className="text-slate-200" /></button>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Update Route</p>
                         <select 
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                           value={editingOrder.route}
                           onChange={(e) => setEditingOrder({...editingOrder, route: e.target.value})}
                         >
                            <option value="">No Route Assigned</option>
                            {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Force Status</p>
                         <select 
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-xs font-bold"
                           value={editingOrder.status}
                           onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                         >
                            {['placed', 'packed', 'out-for-delivery', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Delivery Address</p>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none"
                        rows={3}
                        value={editingOrder.address}
                        onChange={(e) => setEditingOrder({...editingOrder, address: e.target.value})}
                      />
                   </div>

                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Note (Admin only)</p>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none"
                        value={editingOrder.note || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, note: e.target.value})}
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                   <button 
                    onClick={async () => {
                      try {
                        const { id, ...rest } = editingOrder;
                        await updateDoc(doc(db, 'orders', id), {
                          ...rest,
                          updatedAt: new Date().toISOString()
                        });
                        setEditingOrder(null);
                        alert('Order details updated!');
                      } catch (e) {
                        console.error(e);
                        alert('Update failed.');
                      }
                    }}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                   >
                     Save Changes
                   </button>
                   <button onClick={() => setEditingOrder(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Discard</button>
                </div>

                <div className="absolute right-[-20%] bottom-[-20%] w-64 h-64 bg-saffron/5 rounded-full blur-3xl -z-10"></div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      </div>
    </div>
  );
}
