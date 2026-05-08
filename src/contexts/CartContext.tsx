import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types.ts';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (quantity === 0) {
        return prev.filter(item => item.id !== product.id);
      }
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...product, quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.offerPrice * item.quantity), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
