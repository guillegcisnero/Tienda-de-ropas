/**
 * Webhook IPN de Mercado Pago
 * Recibe eventos de pago y consolida el estado final en Supabase (si está configurado)
 * Compatible con Vercel Serverless Functions
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body || {};
  const topic = req.query?.topic || type;
  const paymentId = data?.id || req.query?.id;

  if (topic !== 'payment' && type !== 'payment') {
    return res.status(200).json({ received: true, ignored: true });
  }

  if (!paymentId) {
    return res.status(400).json({ error: 'Missing payment ID' });
  }

  console.log(`[Mercado Pago Webhook] Procesando evento para pago ID: ${paymentId}`);

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!mpAccessToken) {
    console.log('[Mercado Pago Webhook] Modo simulado (sin Access Token). Notificación acusada.');
    return res.status(200).json({ received: true, mode: 'simulated', paymentId });
  }

  try {
    // 1. Consultar estado fehaciente del pago en Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`
      }
    });

    if (!mpRes.ok) {
      console.error(`[Mercado Pago Webhook] Error al consultar pago ${paymentId}: ${mpRes.status}`);
      return res.status(200).json({ received: true, verified: false });
    }

    const paymentData = await mpRes.json();
    const status = paymentData.status; // 'approved', 'rejected', 'pending', etc.
    const externalReference = paymentData.external_reference; // ID de orden o prenda

    console.log(`[Mercado Pago Webhook] Pago ${paymentId} verificado: estado '${status}'`);

    // 2. Si el pago fue aprobado y Supabase está configurado, marcar como 'sold'
    if (status === 'approved' && supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Si external_reference contiene IDs de productos separados por coma
      if (externalReference) {
        const productIds = externalReference.split(',').map((s: string) => s.trim());
        await supabase
          .from('products')
          .update({
            status: 'sold',
            reserved_until: null,
            updated_at: new Date().toISOString()
          })
          .in('id', productIds);

        console.log(`[Mercado Pago Webhook] Prendas [${productIds.join(', ')}] marcadas como 'sold' definitivamente.`);
      }
    }

    return res.status(200).json({ received: true, status, paymentId });
  } catch (err: any) {
    console.error('[Mercado Pago Webhook] Excepción no controlada:', err);
    // Respondemos 200 para evitar que Mercado Pago reintente en bucle en caso de error interno
    return res.status(200).json({ received: true, error: err.message });
  }
}
