import { Product, ShippingConfig, BuyerInfo } from '../types';

interface CreatePreferenceParams {
  cart: Product[];
  shipping: ShippingConfig;
  buyer: BuyerInfo;
}

interface PreferenceResult {
  initPoint?: string;
  isSimulated?: boolean;
  message?: string;
}

/**
 * Servicio para solicitar la creación de la preferencia de pago en Mercado Pago
 */
export async function createPaymentPreference({
  cart,
  shipping,
  buyer
}: CreatePreferenceParams): Promise<PreferenceResult> {
  const response = await fetch('/api/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart.map(i => ({
        id: i.id,
        title: `${i.name} (${i.size})`,
        unit_price: i.price,
        quantity: 1
      })),
      shippingCost: shipping.cost,
      payer: buyer
    })
  });

  if (!response.ok) {
    throw new Error(`Error en la pasarela de pago (${response.status})`);
  }

  const data = await response.json();
  if (data.init_point) {
    return { initPoint: data.init_point };
  }

  return {
    isSimulated: true,
    message: data.message || 'Modo simulado activo'
  };
}
