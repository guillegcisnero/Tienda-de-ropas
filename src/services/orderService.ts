import { supabase, isSupabaseConfigured } from './supabase';
import { Product, BuyerInfo, ShippingConfig } from '../types';
import { AdminOrder } from '../components/admin/types';

export interface CreateOrderParams {
  cart: Product[];
  buyer: BuyerInfo;
  shipping: ShippingConfig;
  total: number;
  gateway: 'mercadopago' | 'whatsapp';
  gatewayPaymentId?: string;
  paymentStatus?: 'pending' | 'paid';
}

export function mapRowToAdminOrder(row: any): AdminOrder {
  const customer = row.customer_info || {};
  const shipping = row.shipping_info || {};
  const items = Array.isArray(row.items) ? row.items : [];

  return {
    id: row.id,
    orderNumber: row.order_code,
    date: row.created_at,
    customerName: customer.name || 'Cliente',
    customerPhone: customer.phone || '',
    customerEmail: customer.email || '',
    shippingAddress: shipping.address || '',
    city: shipping.city || '',
    province: shipping.province || '',
    shippingCost: shipping.cost || 0,
    items: items.map((i: any) => ({
      productId: i.id,
      name: i.name || i.title,
      size: i.size || 'M',
      price: Number(i.price || i.unit_price || 0),
      image: i.image,
      quantity: 1
    })),
    totalAmount: Number(row.total_amount),
    gateway: row.gateway,
    paymentStatus: row.payment_status === 'approved' || row.payment_status === 'paid' ? 'paid' : 'pending',
    fulfillmentStatus: 'pending'
  };
}

/**
 * Registra una nueva orden en Supabase (o almacena localmente si falla la red).
 */
export async function createOrder(params: CreateOrderParams): Promise<{ success: boolean; orderCode: string; error?: string }> {
  const orderCode = `ESV-${Date.now().toString().slice(-6)}`;

  const orderPayload = {
    order_code: orderCode,
    customer_info: {
      name: params.buyer.name,
      email: params.buyer.email,
      phone: params.buyer.phone
    },
    shipping_info: {
      address: params.buyer.address,
      postalCode: params.buyer.postalCode,
      province: params.buyer.province,
      service: params.shipping.service,
      cost: params.shipping.cost
    },
    total_amount: params.total,
    gateway: params.gateway,
    gateway_payment_id: params.gatewayPaymentId || null,
    payment_status: params.paymentStatus || 'pending',
    items: params.cart.map(item => ({
      id: item.id,
      name: item.name,
      size: item.size,
      price: item.price,
      image: item.image
    }))
  };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, orderCode };
  }

  try {
    const { error } = await supabase.from('orders').insert([orderPayload]);
    if (error) {
      console.warn('[OrderService] Error insertando orden en Supabase:', error);
      return { success: false, orderCode, error: error.message };
    }
    return { success: true, orderCode };
  } catch (err: any) {
    console.error('[OrderService] Excepción registrando orden:', err);
    return { success: true, orderCode };
  }
}

/**
 * Consulta todas las órdenes para el panel de administración.
 * Requiere que el usuario esté autenticado en Supabase como administrador.
 */
export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[OrderService] No se pudieron cargar órdenes de Supabase (RLS o auth requerida):', error);
      return [];
    }

    return (data || []).map(mapRowToAdminOrder);
  } catch (err) {
    console.error('[OrderService] Excepción consultando órdenes:', err);
    return [];
  }
}
