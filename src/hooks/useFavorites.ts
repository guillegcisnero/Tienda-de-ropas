import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const FAVORITES_STORAGE_KEY = 'esven_favorites_v1';

export function useFavorites(catalogProducts: Product[], userId?: string | null) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Error guardando favoritos en localStorage:', e);
    }
  }, [favoriteIds]);

  // Si hay usuario logueado y Supabase configurado, sincronizar con la nube
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !userId) return;

    let isMounted = true;

    async function syncWithCloud() {
      try {
        const { data, error } = await supabase!
          .from('favorites')
          .select('product_id')
          .eq('user_id', userId);

        if (error) throw error;

        if (data && isMounted) {
          const cloudIds = data.map((row: { product_id: string }) => row.product_id);
          // Fusión sin duplicados de local + cloud
          setFavoriteIds((prev) => {
            const combined = Array.from(new Set([...prev, ...cloudIds]));
            return combined;
          });
        }
      } catch (err) {
        console.warn('No se pudieron sincronizar los favoritos con Supabase:', err);
      }
    }

    syncWithCloud();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (product: Product) => {
      const exists = favoriteIds.includes(product.id);
      const newIds = exists
        ? favoriteIds.filter((id) => id !== product.id)
        : [...favoriteIds, product.id];

      setFavoriteIds(newIds);

      // Sincronización en segundo plano con Supabase si está logueado
      if (isSupabaseConfigured && supabase && userId) {
        try {
          if (exists) {
            await supabase
              .from('favorites')
              .delete()
              .eq('user_id', userId)
              .eq('product_id', product.id);
          } else {
            await supabase
              .from('favorites')
              .insert({ user_id: userId, product_id: product.id });
          }
        } catch (e) {
          console.warn('Error sincronizando cambio de favorito en Supabase:', e);
        }
      }
    },
    [favoriteIds, userId]
  );

  const removeFavorite = useCallback(
    (productId: string) => {
      setFavoriteIds((prev) => prev.filter((id) => id !== productId));
    },
    []
  );

  // Mapear los IDs a objetos completos del catálogo
  const favoriteProducts = useMemo(() => {
    return favoriteIds
      .map((id) => catalogProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [favoriteIds, catalogProducts]);

  return {
    favoriteIds,
    favoriteProducts,
    favoritesCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}
