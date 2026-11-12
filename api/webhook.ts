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

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!mpAccessToken) {
    console.log('[Mercado Pago Webhook] Modo simulado (sin Access Token). Notificación acusada.');
    return res.status(200).json({ received: true, mode: 'simulated', paymentId });
  }

  // 1. Verificación Criptográfica Obligatoria (Fail-Closed)
  if (!webhookSecret) {
    console.error('[Security Misconfiguration] MERCADOPAGO_WEBHOOK_SECRET no configurado.');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Security Misconfiguration] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en webhook.');
    return res.status(500).json({ error: 'Database configuration missing' });
  }

  const xSignature = req.headers['x-signature'] as string | undefined;
  const xRequestId = req.headers['x-request-id'] as string | undefined;
  const isValid = verifyMercadoPagoSignature(xSignature, xRequestId, String(paymentId), webhookSecret);

  if (!isValid) {
    console.warn(`[Security Alert] Intento de webhook con firma HMAC inválida. Payment ID: ${paymentId}`);
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  console.log(`[Mercado Pago Webhook] Procesando evento para pago ID: ${paymentId}`);

  try {
    // 2. Consultar estado fehaciente del pago en la API oficial de Mercado Pago (Zero-Trust)
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(String(paymentId))}`, {
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

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Idempotencia: evitar reprocesar un pago ya consolidado
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('gateway_payment_id', String(paymentId))
      .in('payment_status', ['approved', 'paid'])
      .maybeSingle();

    if (existingOrder) {
      console.log(`[Mercado Pago Webhook] Pago ${paymentId} ya procesado previamente. Omitiendo.`);
      return res.status(200).json({ received: true, deduplicated: true, paymentId });
    }

    // 4. Si el pago fue aprobado, validar moneda y monto antes de marcar como 'sold'
    if (status === 'approved') {
      if (paymentData.currency_id && paymentData.currency_id !== 'ARS') {
        console.warn(`[Security Alert] Moneda inesperada (${paymentData.currency_id}) en pago ${paymentId}`);
        return res.status(200).json({ received: true, verified: false, reason: 'currency_mismatch' });
      }

      if (externalReference) {
        const productIds = Array.from(
          new Set(String(externalReference).split(',').map((s: string) => s.trim()).filter(Boolean))
        );

        if (productIds.length > 0) {
          const { data: dbProducts, error: fetchErr } = await supabase
            .from('products')
            .select('id, price')
            .in('id', productIds);

          if (fetchErr || !dbProducts || dbProducts.length === 0) {
            console.error(`[Mercado Pago Webhook] Error consultando productos para pago ${paymentId}:`, fetchErr);
            return res.status(500).json({ error: 'Error verifying products' });
          }

          const expectedProductsTotal = dbProducts.reduce((sum: number, p: any) => sum + Number(p.price), 0);
          const paidAmount = Number(paymentData.transaction_amount || 0);

          if (paidAmount < expectedProductsTotal) {
            console.warn(
              `[Security Alert] Monto abonado (${paidAmount}) menor al total de productos (${expectedProductsTotal}) para pago ${paymentId}`
            );
            return res.status(200).json({ received: true, verified: false, reason: 'amount_mismatch' });
          }

          const { error: updateErr } = await supabase
            .from('products')
            .update({
              status: 'sold',
              reserved_until: null,
              updated_at: new Date().toISOString()
            })
            .in('id', productIds);

          if (updateErr) {
            console.error(`[Mercado Pago Webhook] Error marcando prendas como 'sold':`, updateErr);
            return res.status(500).json({ error: 'Database update failed' });
          }

          console.log(`[Mercado Pago Webhook] Prendas [${productIds.join(', ')}] marcadas como 'sold' definitivamente.`);
        }
      }
    } else if (status === 'rejected' || status === 'cancelled') {
      if (externalReference) {
        const productIds = Array.from(
          new Set(String(externalReference).split(',').map((s: string) => s.trim()).filter(Boolean))
        );
        if (productIds.length > 0) {
          const { error: releaseErr } = await supabase
            .from('products')
            .update({
              status: 'available',
              reserved_until: null,
              updated_at: new Date().toISOString()
            })
            .in('id', productIds)
            .eq('status', 'reserved');

          if (releaseErr) {
            console.error(`[Mercado Pago Webhook] Error liberando prendas tras pago ${status}:`, releaseErr);
            return res.status(500).json({ error: 'Database release failed' });
          }

          console.log(`[Mercado Pago Webhook] Pago ${status}. Prendas [${productIds.join(', ')}] liberadas a 'available'.`);
        }
      }
    }

    return res.status(200).json({ received: true, status, paymentId });
  } catch (err: any) {
    console.error('[Mercado Pago Webhook] Excepción no controlada:', err);
    return res.status(500).json({ error: 'Internal webhook error' });
  }
}
