import { Product, ShippingConfig, BuyerInfo } from '../types';
import { formatPrice } from '../utils/formatters';

interface BuildOrderParams {
  cart: Product[];
  shipping: ShippingConfig;
  total: number;
  buyer: BuyerInfo;
  whatsappNumber: string;
}

/**
 * Genera la URL de WhatsApp con el pedido formateado y sanitizado
 * Cumple con los Guardrails de sanitización y cero fuga de datos sensibles
 */
export function buildWhatsAppOrderUrl({
  cart,
  shipping,
  total,
  buyer,
  whatsappNumber
}: BuildOrderParams): string {
  const itemsList = cart
    .map((item, idx) => `👗 ${idx + 1}. *${item.name}* (${item.size}) - ${formatPrice(item.price)}`)
    .join('\n');

  const shippingPriceText = shipping.cost === 0 ? 'Gratis' : formatPrice(shipping.cost);

  const message = [
    '🌿 *¡Hola ESVEN! Quiero comprar estas prendas únicas:*',
    '',
    itemsList,
    '',
    `📦 *Envío:* ${shipping.service} (${shippingPriceText})`,
    `💰 *Total a abonar:* ${formatPrice(total)}`,
    '',
    '👤 *Mis Datos para el Envío:*',
    `• Nombre: ${buyer.name.trim() || 'A coordinar'}`,
    `• Teléfono: ${buyer.phone.trim() || 'A coordinar'}`,
    `• Dirección: ${buyer.address.trim() || 'A coordinar'} (CP: ${buyer.postalCode.trim() || '-'})`,
    `• Provincia: ${buyer.province || shipping.province}`,
    '',
    '¿Me pasás el alias / CBU o link de pago para transferirte y reservarlas ya?'
  ].join('\n');

  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
