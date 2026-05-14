import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CheckCircle2, Package, Phone, User, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../contexts/CartContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { apiClient } from '../lib/api.ts';

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, addToCart, clearCart } = useCart();
  const { t } = useLanguage();
  const [isSuccess, setIsSuccess] = React.useState<string | false>(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
    route: 'Route 1 (City)'
  });

  const handlePhoneChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: sanitized });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const customerName = formData.customerName.trim();
    const phone = formData.phone.replace(/\D/g, '').slice(0, 10);
    const address = formData.address.trim();

    if (phone.length !== 10) {
      alert(t('onlyTenDigits'));
      return;
    }
    
    setLoading(true);

    try {
      const orderData = {
        customerName,
        phone,
        address,
        route: formData.route,
        items,
        totalAmount: total,
        note: formData.note.trim()
      };

      const response = await apiClient.createOrder(orderData);
      clearCart();
      setIsSuccess(response.orderNumber || response.order?.orderNumber || false);
      setTimeout(() => navigate('/orders'), 10000);
    } catch (error: any) {
      console.error('Order submission failed', error);
      alert('Failed to place order: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-paper">
         <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-16 rounded-[60px] shadow-2xl text-center space-y-6 max-w-lg border border-slate-100"
         >
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200">
               <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-serif italic font-bold text-slate-800">Order Placed!</h2>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Order Number</p>
               <p className="text-3xl font-mono font-bold text-slate-900 tracking-widest">{isSuccess}</p>
            </div>
            <p className="text-slate-400">Is order number ko note kar lein tracking ke liye. Aapka order successfully receive ho gaya hai.</p>
            <div className="pt-6">
               <button onClick={() => navigate('/track')} className="text-saffron font-bold text-xs uppercase tracking-widest flex items-center gap-2 mx-auto border-b-2 border-saffron pb-1">Track Progress →</button>
            </div>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-paper p-10">
       <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-4xl font-serif font-bold italic text-slate-800">{t('shoppingCartTitle')}</h2>
                   <p className="text-slate-400 text-sm">{t('shoppingCartDesc')}</p>
                </div>
                <button 
                  onClick={clearCart}
                  className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2"
                >
                   <Trash2 size={14} /> Clear Cart
                </button>
             </div>

             <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 group-hover:text-saffron transition-colors">
                           <Package size={28} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.company}</p>
                           <h4 className="font-bold text-slate-800">{item.name}</h4>
                           <p className="text-xs font-bold text-saffron mt-1">₹{item.offerPrice || item.mrp}</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1">
                           <button 
                            onClick={() => addToCart(item as any, item.quantity - (item.orderStep || 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm hover:text-red-500 transition-all font-bold"
                           >
                              <Minus size={14} />
                           </button>
                           <input 
                              type="number"
                              min="0"
                              step={item.orderStep || 1}
                              className="font-bold text-sm w-12 text-center bg-transparent focus:outline-none"
                              value={item.quantity}
                              onChange={(e) => {
                                 const val = Number(e.target.value);
                                 if (!isNaN(val) && val >= 0) {
                                    addToCart(item as any, val);
                                 }
                              }}
                           />
                           <button 
                            onClick={() => addToCart(item as any, item.quantity + (item.orderStep || 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm hover:text-saffron transition-all font-bold"
                           >
                              <Plus size={14} />
                           </button>
                        </div>
                        <p className="font-bold text-slate-800 w-20 text-right">₹{(item.offerPrice || item.mrp) * item.quantity}</p>
                     </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="p-20 text-center opacity-40">
                     <ShoppingCart size={60} className="mx-auto mb-4" />
                     <p className="font-serif italic text-xl">Cart is empty.</p>
                  </div>
                )}
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                   <User size={20} className="text-saffron" />
                   {t('customerDetails')}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                   <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">{t('fullNameShop')}</p>
                      <div className="relative">
                         <input 
                            required
                            type="text" 
                            className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all font-medium"
                            value={formData.customerName}
                            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                         />
                         <User className="absolute left-4 top-3 text-slate-500" size={16} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">{t('phoneNumber')}</p>
                      <div className="relative">
                         <input 
                            required
                            type="tel" 
                            placeholder="Enter 10 digit mobile"
                            inputMode="numeric"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all font-medium"
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                          />
                          <Phone className="absolute left-4 top-3 text-slate-500" size={16} />
                       </div>
                       <p className="text-[10px] text-slate-500 pl-2">{t('onlyTenDigits')}</p>
                    </div>

                   <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">{t('fullAddress')}</p>
                      <div className="relative">
                         <input 
                            required
                            type="text" 
                            placeholder="Shop No, Street, Landmark..."
                            className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all font-medium"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                         />
                         <House className="absolute left-4 top-3 text-slate-500" size={16} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">{t('specialNoteOptional')}</p>
                      <div className="relative">
                         <textarea 
                            rows={2}
                            placeholder="Example: Call before delivery"
                            className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all font-medium resize-none"
                            value={formData.note}
                            onChange={(e) => setFormData({...formData, note: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">{t('routeDeliveryArea')}</p>
                      <div className="relative">
                         <select 
                            className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/20 transition-all font-medium appearance-none"
                            value={formData.route}
                            onChange={(e) => setFormData({...formData, route: e.target.value})}
                         >
                            {['Route 1 (City)', 'Route 2 (North)', 'Route 3 (South)', 'Route 4 (East)', 'Route 5 (West)', 'Route 6 (Village)'].map(r => (
                              <option key={r} value={r} className="text-black">{r}</option>
                            ))}
                         </select>
                         <House className="absolute left-4 top-3 text-slate-500" size={16} />
                      </div>
                   </div>

                   <div className="pt-6 space-y-4">
                      <div className="flex justify-between items-center text-slate-400 text-sm">
                         <span>{t('subtotal')}</span>
                         <span>₹{total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-white text-2xl font-bold">
                         <span>{t('total')}</span>
                         <span>₹{total.toLocaleString()}</span>
                      </div>
                   </div>

                   <button 
                    type="submit"
                    disabled={loading || items.length === 0}
                    className="w-full bg-saffron text-white py-5 rounded-3xl font-bold shadow-xl shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-10"
                   >
                      {loading ? t('processing') : t('placeOrderNow')}
                      {!loading && <ArrowRight size={20} />}
                   </button>
                </form>
                <div className="absolute right-[-10%] bottom-[-10%] w-64 h-64 bg-saffron/5 rounded-full blur-3xl"></div>
             </div>
          </div>
       </div>
    </div>
  );
}
