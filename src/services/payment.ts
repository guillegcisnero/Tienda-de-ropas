import { Product, ShippingConfig, BuyerInfo } from '../types';

interface CreatePreferenceParams {
  cart: Product[];
  shipping: ShippingConfig;
  shippingRegion?: string;
  buyer: BuyerInfo;
}

export interface PreferenceResult {
  initPoint?: string;
  isSimulated?: boolean;
  message?: string;
  reservationExpiresAt?: string;
  reservedProductIds?: string[];
  reservationToken?: string;
  orderCode?: string;
}

/**
 * Servicio para solicitar la creación de la preferencia de pago en Mercado Pago
 */
export async function createPaymentPreference({
  cart,
  shippingRegion,
  buyer
}: CreatePreferenceParams): Promise<PreferenceResult> {
  const response = await fetch('/api/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(i => ({ id: i.id })),
      shippingRegion: shippingRegion || 'cabaGba',
      payer: buyer
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error en la pasarela de pago (${response.status})`);
  }

  const data = await response.json();
  if (data.init_point) {
    return { 
      initPoint: data.init_point,
      reservationExpiresAt: data.reservationExpiresAt,
      reservedProductIds: data.reservedProductIds,
      reservationToken: data.reservationToken,
      orderCode: data.orderCode
    };
  }

  return {
    isSimulated: true,
    message: data.message || 'Modo simulado activo',
    reservationExpiresAt: data.reservationExpiresAt,
    reservedProductIds: data.reservedProductIds,
    reservationToken: data.reservationToken,
    orderCode: data.orderCode
  };
}

/**
 * Libera reservas de prendas si el usuario cancela o expira el checkout
 */
export async function releasePaymentReservation(
  productIds: string[],
  reservationToken?: string
): Promise<boolean> {
  if (!productIds || productIds.length === 0) return true;
  try {
    const res = await fetch('/api/release-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, reservationToken })
    });
    return res.ok;
  } catch {
    return false;
  }
}
