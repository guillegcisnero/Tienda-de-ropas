import crypto from 'crypto';

/**
 * Webhook IPN de Mercado Pago con Verificación Criptográfica (HMAC-SHA256)
 * Recibe eventos de pago y consolida el estado final en Supabase
 * Compatible con Vercel Serverless Functions
 */

function verifyMercadoPagoSignature(
  xSignature: string | undefined,
  xRequestId: string | undefined,
  dataId: string | undefined,
  secretKey: string
): boolean {
  if (!xSignature || !secretKey) return false;

  try {
    // x-signature format: "ts=1704067200,v1=abc123def456..."
    const parts = xSignature.split(',').reduce((acc: Record<string, string>, curr: string) => {
      const [key, value] = curr.split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {});

    const ts = parts['ts'];
    const hash = parts['v1'];

    if (!ts || !hash) return false;

    // Mercado Pago Template: id:[data.id_url];request-id:[x-request-id];ts:[ts];
    // Nota: si dataId no está presente en query/body, se valida con lo disponible
    const manifest = `id:${dataId || ''};request-id:${xRequestId || ''};ts:${ts};`;
    
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');

    // Comparación criptográfica en tiempo constante (Anti-Timing Attacks)
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'utf8'),
      Buffer.from(hash, 'utf8')
    );
  } catch (err) {
    console.error('[Security Warning] Error verificando firma de webhook:', err);
    return false;
  }
}

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

  // 1. Verificación Criptográfica de la Firma del Webhook
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const xSignature = req.headers['x-signature'] as string | undefined;
    const xRequestId = req.headers['x-request-id'] as string | undefined;
    const isValid = verifyMercadoPagoSignature(xSignature, xRequestId, String(paymentId), webhookSecret);

    if (!isValid) {
      console.warn(`[Security Alert] Intento de webhook con firma HMAC inválida. Payment ID: ${paymentId}`);
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }
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
    // 2. Consultar estado fehaciente del pago en la API oficial de Mercado Pago (Zero-Trust)
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
    const externalReference = paymentData.external_reference; // IDs de prendas

    console.log(`[Mercado Pago Webhook] Pago ${paymentId} verificado fehacientemente: estado '${status}'`);

    // 3. Si el pago fue aprobado y Supabase está configurado, marcar como 'sold'
    if (status === 'approved' && supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      if (externalReference) {
        const productIds = externalReference.split(',').map((s: string) => s.trim()).filter(Boolean);
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
    } else if ((status === 'rejected' || status === 'cancelled') && supabaseUrl && supabaseKey) {
      if (externalReference) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        const productIds = externalReference.split(',').map((s: string) => s.trim()).filter(Boolean);
        await supabase
          .from('products')
          .update({
            status: 'available',
            reserved_until: null,
            updated_at: new Date().toISOString()
          })
          .in('id', productIds)
          .eq('status', 'reserved');

        console.log(`[Mercado Pago Webhook] Pago ${status}. Prendas [${productIds.join(', ')}] liberadas a 'available'.`);
      }
    }

    return res.status(200).json({ received: true, status, paymentId });
  } catch (err: any) {
    console.error('[Mercado Pago Webhook] Excepción no controlada:', err);
    // Respondemos 200 para evitar que Mercado Pago reintente en bucle en caso de error interno transitorio
    return res.status(200).json({ received: true, error: err.message });
  }
}
