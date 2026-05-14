import React, { createContext, useContext, useEffect, useState } from 'react';
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

const normalizeQuantity = (product: Product, quantity: number) => {
  const stock = Number(product.stock ?? 0);
  const minQty = Number(product.minQty ?? 1);
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0 || stock <= 0) {
    return 0;
  }

  const adjustedQuantity = parsedQuantity < minQty ? minQty : parsedQuantity;
  const clampedQuantity = Math.min(adjustedQuantity, stock);

  return Number(clampedQuantity.toFixed(3));
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedItems = localStorage.getItem('cart_items');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number) => {
    const productId = product.id || (product as any)._id || '';
    const safeQuantity = normalizeQuantity(product, quantity);

    setItems(prev => {
      const existing = prev.find(item => item.id === productId);

      if (safeQuantity === 0) {
        return prev.filter(item => item.id !== productId);
      }

      if (existing) {
        return prev.map(item => item.id === productId ? { ...product, id: productId, quantity: safeQuantity } : item);
      }

      return [...prev, { ...product, id: productId, quantity: safeQuantity }];
    });
  };

  const clearCart = () => {
    localStorage.removeItem('cart_items');
    setItems([]);
  };

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
