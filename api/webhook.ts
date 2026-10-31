/**
 * Webhook IPN de Mercado Pago
 * Recibe eventos de pago aprobado y actualiza el stock 1/1 de la prenda única
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body || {};

  // Notificación de pago
  if (type === 'payment' || req.query?.topic === 'payment') {
    const paymentId = data?.id || req.query?.id;
    console.log(`[Mercado Pago Webhook] Notificación de pago recibida: ${paymentId}`);

    // Aquí cuando se conecte Supabase:
    // 1. Consultar estado del pago en MP: GET /v1/payments/{paymentId}
    // 2. Si status === 'approved', marcar prenda única en Supabase como available: false
    // 3. Notificar a WhatsApp o registrar venta
    return res.status(200).json({ received: true, paymentId });
  }

  return res.status(200).json({ received: true });
}
