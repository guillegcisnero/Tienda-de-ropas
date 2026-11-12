import { supabase, isSupabaseConfigured } from './supabase';
import { SHIPPING_RATES } from '../data/mockCatalog';

export interface DbShippingRate {
  id: string;
  name: string;
  price: number;
  days: string;
  active: boolean;
}

/**
 * Obtiene las tarifas de envío desde Supabase (o fallback local en mockCatalog)
 */
export async function getShippingRates(): Promise<Record<string, { name: string; price: number; days: string }>> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('id, name, price, days, active')
        .eq('active', true);

      if (!error && data && data.length > 0) {
        const ratesMap: Record<string, { name: string; price: number; days: string }> = {};
        for (const r of data) {
          ratesMap[r.id] = {
            name: r.name,
            price: Number(r.price),
            days: r.days
          };
        }
        return ratesMap;
      }
    } catch (err) {
      console.warn('[ShippingRatesService] Error cargando tarifas de DB, usando locales:', err);
    }
  }

  return SHIPPING_RATES;
}

/**
 * Actualiza una tarifa de envío en Supabase (solo administradores autenticados)
 */
export async function updateShippingRate(id: string, price: number): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('shipping_rates')
      .update({ price, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }
  return true;
}
