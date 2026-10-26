import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, OrderType } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';

interface CartContextType {
  cart: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
}

const CART_STORAGE_KEY = 'urban_bites_cart';
const ORDER_TYPE_KEY = 'urban_bites_order_type';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderType] = useState<OrderType>(() => {
    try {
      const saved = localStorage.getItem(ORDER_TYPE_KEY);
      return saved === 'pickup' ? 'pickup' : 'delivery';
    } catch {
      return 'delivery';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDER_TYPE_KEY, orderType);
    } catch (e) {
      console.error('Failed to save order type to localStorage', e);
    }
  }, [orderType]);

  const addItem = (item: MenuItem, quantity = 1): boolean => {
    if (!item.isAvailable) {
      return false;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.menuItem.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { menuItem: item, quantity }];
    });

    return true;
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === itemId
          ? { ...item, quantity: Math.min(quantity, 20) } // Max 20 per item
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const deliveryFee =
    orderType === 'pickup' || subtotal === 0 || subtotal >= RESTAURANT_INFO.freeDeliveryThreshold
      ? 0
      : RESTAURANT_INFO.deliveryFee;

  const tax = Math.round(subtotal * (RESTAURANT_INFO.taxRatePercent / 100));

  const total = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        total,
        orderType,
        setOrderType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
