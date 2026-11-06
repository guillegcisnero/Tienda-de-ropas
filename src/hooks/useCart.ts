import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';

const STORAGE_KEY = 'aura_preloved_cart_v1';

export function useCart(catalogProducts: Product[] = []) {
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

  // Reconciliación de Stock en Tiempo Real frente al Catálogo
  const { availableItems, unavailableItems } = useMemo(() => {
    if (!catalogProducts || catalogProducts.length === 0) {
      return { availableItems: cart, unavailableItems: [] };
    }

    const available: Product[] = [];
    const unavailable: Product[] = [];

    cart.forEach((cartItem) => {
      const liveProduct = catalogProducts.find((p) => p.id === cartItem.id);
      // Si el producto existe en el catálogo y sigue disponible:
      if (liveProduct && liveProduct.available) {
        available.push(liveProduct); // Actualizado con datos frescos del catálogo
      } else {
        // Marcado como no disponible o ya vendido a otro comprador
        unavailable.push({
          ...cartItem,
          available: false,
        });
      }
    });

    return { availableItems: available, unavailableItems: unavailable };
  }, [cart, catalogProducts]);

  const isInCart = useCallback(
    (productId: string) => {
      return availableItems.some((item) => item.id === productId);
    },
    [availableItems]
  );

  const addToCart = useCallback(
    (product: Product): { success: boolean; message: string } => {
      if (cart.some((item) => item.id === product.id)) {
        return {
          success: false,
          message: 'Esta prenda única ya está en tu carrito',
        };
      }
      setCart((prev) => [...prev, product]);
      return {
        success: true,
        message: `¡${product.name} agregada al carrito!`,
      };
    },
    [cart]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Eliminar un item que ya no está disponible
  const dismissUnavailable = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  // Mover una prenda no disponible a Favoritos y quitarla del carrito
  const moveUnavailableToFavorites = useCallback(
    (productId: string, addToFavorites: (product: Product) => void) => {
      const item = cart.find((p) => p.id === productId);
      if (item) {
        addToFavorites(item);
        removeFromCart(productId);
      }
    },
    [cart, removeFromCart]
  );

  // Subtotal calculado EXCLUSIVAMENTE sobre prendas disponibles
  const subtotal = useMemo(() => {
    return availableItems.reduce((sum, item) => sum + item.price, 0);
  }, [availableItems]);

  const itemCount = availableItems.length;

  return {
    cart,
    availableItems,
    unavailableItems,
    hasUnavailableItems: unavailableItems.length > 0,
    subtotal,
    itemCount,
    isInCart,
    addToCart,
    removeFromCart,
    clearCart,
    dismissUnavailable,
    moveUnavailableToFavorites,
  };
}
