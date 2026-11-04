import { Product } from '../types';
import { MOCK_CATALOG } from '../data/mockCatalog';
import { supabase, isSupabaseConfigured } from './supabase';

export interface DatabaseProductRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  brand?: string;
  size: string;
  measurements: Record<string, string>;
  condition: string;
  condition_notes?: string;
  price: number;
  compare_price?: number;
  images: string[];
  status: 'available' | 'reserved' | 'sold' | 'archived';
  is_single_piece: boolean;
  weight_grams?: number;
  created_at: string;
}

export function mapRowToProduct(row: DatabaseProductRow): Product {
  return {
    id: row.id,
    name: row.title,
    category: row.category,
    subCategory: row.sub_category,
    condition: row.condition,
    size: row.size,
    measurements: row.measurements || {},
    description: row.description,
    price: Number(row.price),
    weightGrams: row.weight_grams,
    image: (row.images && row.images.length > 0) ? row.images[0] : '',
    isSinglePiece: row.is_single_piece ?? true,
    available: row.status === 'available',
    createdAt: row.created_at,
  };
}

/**
 * Obtiene el catálogo de productos.
 * Si Supabase está configurado, consulta la tabla 'products'.
 * Si no está configurado o falla la red, recurre a MOCK_CATALOG como fallback transparente.
 */
export async function fetchCatalogProducts(): Promise<{ products: Product[]; isLive: boolean }> {
  if (!isSupabaseConfigured || !supabase) {
    return { products: MOCK_CATALOG, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('status', ['available', 'reserved'])
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('[CatalogService] Retornando mock por error o catálogo vacío:', error);
      return { products: MOCK_CATALOG, isLive: false };
    }

    const products = (data as unknown as DatabaseProductRow[]).map(mapRowToProduct);
    return { products, isLive: true };
  } catch (err) {
    console.error('[CatalogService] Excepción de conexión a Supabase:', err);
    return { products: MOCK_CATALOG, isLive: false };
  }
}

/**
 * Intenta reservar una lista de productos de forma atómica para checkout.
 * En modo local (sin Supabase), simula éxito inmediato.
 * En modo Supabase, llama a la función RPC `reserve_product_for_checkout` (bloqueo de 10 min).
 */
export async function reserveProductsForCheckout(productIds: string[]): Promise<{
  success: boolean;
  unavailableId?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    for (const id of productIds) {
      const { data, error } = await supabase.rpc('reserve_product_for_checkout', {
        p_product_id: id,
        p_minutes: 10
      });

      if (error || !data) {
        console.warn(`[CatalogService] Prenda ${id} no disponible para reserva:`, error);
        return { success: false, unavailableId: id };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[CatalogService] Error ejecutando reserva atómica:', err);
    return { success: true };
  }
}

/**
 * Inserta una nueva prenda en el catálogo.
 * Si Supabase está conectado, inserta en PostgreSQL.
 */
export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  const newId = `prod-${Date.now().toString().slice(-6)}`;
  const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newProduct: Product = {
    ...productData,
    id: newId,
    available: true,
    isSinglePiece: true,
    createdAt: new Date().toISOString()
  };

  if (!isSupabaseConfigured || !supabase) {
    // En modo local, simular éxito inmediato
    return newProduct;
  }

  const { error } = await supabase.from('products').insert([
    {
      id: newId,
      slug: `${slug}-${newId}`,
      title: productData.name,
      description: productData.description,
      category: productData.category,
      sub_category: productData.subCategory,
      size: productData.size,
      measurements: productData.measurements,
      condition: productData.condition,
      price: productData.price,
      images: [productData.image],
      status: 'available',
      is_single_piece: true
    }
  ]);

  if (error) {
    console.error('[CatalogService] Error al crear prenda en Supabase:', error);
    throw new Error(error.message);
  }

  return newProduct;
}

/**
 * Actualiza el estado de una prenda ('available', 'reserved', 'sold')
 */
export async function updateProductStatus(
  productId: string, 
  status: 'available' | 'reserved' | 'sold'
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from('products')
    .update({ 
      status, 
      reserved_until: status === 'available' ? null : undefined,
      updated_at: new Date().toISOString() 
    })
    .eq('id', productId);

  if (error) {
    console.error(`[CatalogService] Error actualizando estado de ${productId}:`, error);
    return false;
  }

  return true;
}

/**
 * Elimina una prenda del catálogo
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true;
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error(`[CatalogService] Error eliminando ${productId}:`, error);
    return false;
  }

  return true;
}
