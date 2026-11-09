import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { MOCK_CATALOG } from '../data/mockCatalog';
import { fetchCatalogProducts, mapRowToProduct, DatabaseProductRow } from '../services/catalogService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>(() => {
    return import.meta.env.PROD ? [] : MOCK_CATALOG;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { products: loaded, isLive: live, error: err } = await fetchCatalogProducts();
    setProducts(loaded);
    setIsLive(live);
    if (err) setError(err);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();

    // Si Supabase está configurado, suscribirse a eventos de Realtime
    if (!isSupabaseConfigured || !supabase) return;

    const client = supabase;
    const channel = client
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProduct = mapRowToProduct(payload.new as DatabaseProductRow);
            setProducts((prev) => [newProduct, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedProduct = mapRowToProduct(payload.new as DatabaseProductRow);
            setProducts((prev) =>
              prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== (payload.old as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [loadProducts]);

  return {
    products,
    isLoading,
    isLive,
    error,
    refreshCatalog: loadProducts,
  };
}
