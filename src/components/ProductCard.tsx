import React from 'react';
import { Product } from '../types.ts';
import { ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

import { useCart } from '../contexts/CartContext.tsx';

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, items } = useCart();
  const existingItem = items.find(item => item.id === product.id);
  const quantity = existingItem ? existingItem.quantity : 0;
  
  const minQty = product.minQty || 1;
  const step = product.orderStep || 1;
  const discount = Math.round(((product.mrp - product.offerPrice) / product.mrp) * 100);

  const increment = () => {
    const next = quantity === 0 ? minQty : quantity + step;
    if (next <= product.stock) {
      addToCart(product, next);
    }
  };

  const decrement = () => {
    const next = quantity - step;
    addToCart(product, next >= minQty ? next : 0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileHover={{ y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white p-6 rounded-[32px] border transition-all group relative flex flex-col ${
        product.stock <= 0 ? 'opacity-60 grayscale' : 'shadow-sm border-slate-100 hover:shadow-xl hover:border-saffron/20'
      }`}
    >
      <div className="aspect-square bg-slate-50 rounded-[24px] mb-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <span className="text-[9px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-slate-500 px-3 py-1.5 rounded-full shadow-sm w-fit">
            {product.company}
          </span>
          {discount > 0 && product.stock > 0 && (
            <span className="text-[9px] font-bold bg-green-500 text-white px-3 py-1.5 rounded-full shadow-sm w-fit">
              Saste mein: {discount}% OFF
            </span>
          )}
        </div>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-100/40 flex items-center justify-center z-10">
             <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-xl rotate-[-5deg]">Khatam (Out of Stock)</span>
          </div>
        )}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
        ) : (
          <Package className="text-slate-200 group-hover:rotate-12 transition-transform" size={60} />
        )}
      </div>
      
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2 mb-1">
           <span className="w-1 h-1 bg-saffron rounded-full"></span>
           <p className="text-[9px] font-bold text-saffron uppercase tracking-[0.2em]">
             {product.category}
           </p>
        </div>
        <h3 className="font-bold text-slate-800 leading-tight text-lg mb-2">{product.name}</h3>
        <div className="flex items-center justify-between py-2 border-y border-slate-50">
           <p className="text-slate-400 text-[10px] font-bold tracking-widest">
             WEIGHT: {product.unit}
           </p>
           <p className={`text-[10px] font-bold ${product.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
             {product.stock > 0 ? `Stock: ${product.stock} ${product.unit}` : 'Coming soon'}
           </p>
        </div>
        {minQty > 1 && (
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Min: {minQty} {product.unit}</p>
        )}
      </div>
      
      <div className="flex items-end justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Aapka rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">₹{product.offerPrice}</span>
            <span className="text-xs text-slate-300 line-through">₹{product.mrp} MRP</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quantity === 0 ? (
            <button 
              onClick={() => product.stock > 0 && increment()}
              disabled={product.stock <= 0}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                product.stock > 0 ? 'bg-slate-900 text-white hover:bg-saffron' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              <Plus size={24} />
            </button>
          ) : (
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1">
              <button 
                onClick={decrement}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm hover:text-red-500 transition-all font-bold"
              >
                <Minus size={16} />
              </button>
              <input 
                type="number"
                className="font-bold text-base w-12 text-center bg-transparent focus:outline-none"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    if (val <= product.stock) {
                      addToCart(product, val);
                    }
                  }
                }}
              />
              <button 
                onClick={increment}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm hover:text-saffron transition-all font-bold"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
