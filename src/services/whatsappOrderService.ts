import { Product, ShippingConfig, BuyerInfo } from '../types';

interface CreateWhatsAppOrderParams {
  cart: Product[];
  buyer: BuyerInfo;
  shipping: ShippingConfig;
  shippingRegion?: string;
  whatsappNumber: string;
}

export interface WhatsAppOrderResult {
  orderCode: string;
  total: number;
  waUrl: string;
}

/**
 * Crea una orden de WhatsApp validada del lado del servidor
 */
export async function createWhatsAppOrder({
  cart,
  buyer,
  shippingRegion
}: CreateWhatsAppOrderParams): Promise<WhatsAppOrderResult> {
  const response = await fetch('/api/create-whatsapp-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(i => ({ id: i.id })),
      shippingRegion: shippingRegion || 'cabaGba',
      buyer
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error creando orden de WhatsApp (${response.status})`);
  }

  return await response.json();
}
