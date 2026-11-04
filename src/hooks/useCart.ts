import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';

const STORAGE_KEY = 'aura_preloved_cart_v1';

export function useCart() {
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistencia automática en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Error guardando carrito en localStorage:', e);
    }
  }, [cart]);

  const isInCart = useCallback((productId: string) => {
    return cart.some(item => item.id === productId);
  }, [cart]);

  const addToCart = useCallback((product: Product): { success: boolean; message: string } => {
    if (cart.some(item => item.id === product.id)) {
      return {
        success: false,
        message: 'Esta prenda única ya está en tu carrito'
      };
    }
    setCart(prev => [...prev, product]);
    return {
      success: true,
      message: `¡${product.name} agregada al carrito!`
    };
  }, [cart]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  }, [cart]);

  const itemCount = cart.length;

  return {
    cart,
    subtotal,
    itemCount,
    isInCart,
    addToCart,
    removeFromCart,
    clearCart
  };
}
