import crypto from 'crypto';

interface ItemPayload {
  id: string;
}

interface RequestBody {
  items: ItemPayload[];
  shippingRegion?: string;
  payer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    province: string;
  };
}

// Control de concurrencia y Rate Limiting en memoria por IP (Mitigación DoS / Spam)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function resolveBaseUrl(): string | null {
  const configured =
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000';
  }

  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Rate Limiting por IP (20 solicitudes por minuto por IP)
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const clientRecord = rateLimitMap.get(clientIp);

  if (clientRecord && now < clientRecord.resetTime) {
    if (clientRecord.count >= 20) {
      return res.status(429).json({ error: 'Límite de solicitudes excedido. Reintente en un minuto.' });
    }
    clientRecord.count++;
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + 60000 });
    if (rateLimitMap.size > 2000) rateLimitMap.clear();
  }

  const { items, shippingRegion = 'cabaGba', payer } = (req.body || {}) as RequestBody;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items requeridos en formato de lista válido' });
  }

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Si no está configurado el Access Token en variables de entorno, devolvemos fallback simulado
  if (!mpAccessToken) {
    const reservationToken = `sim-${crypto.randomUUID()}`;
    return res.status(200).json({
      status: 'simulated',
      message: 'Modo simulado activo. Configure MERCADOPAGO_ACCESS_TOKEN en Vercel para cobros reales.',
      init_point: null,
      reservationToken
    });
  }

  // Fail-closed: en producción con cobros reales, es obligatorio contar con Service Role y URL canónica
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Security Misconfiguration] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en entorno de pagos.');
    return res.status(500).json({ error: 'Configuración del servidor de pagos incompleta.' });
  }

  const baseUrl = resolveBaseUrl();
  if (!baseUrl) {
    console.error('[Security Misconfiguration] Falta APP_URL / VERCEL_URL para back_urls y notification_url.');
    return res.status(500).json({ error: 'Configuración de URL base incompleta en el servidor.' });
  }

  const productIds = Array.from(new Set(items.map(item => String(item.id).trim()).filter(Boolean)));
  if (productIds.length === 0 || productIds.length !== items.length) {
    return res.status(400).json({ error: 'Lista de prendas inválida o con IDs duplicados.' });
  }

  let reservedInDb = false;
  let reservationToken: string | null = null;
  let supabaseClient: any = null;

  const rollbackReservation = async () => {
    if (!reservedInDb || !supabaseClient) return;
    try {
      if (reservationToken) {
        await supabaseClient
          .from('product_reservations')
          .delete()
          .eq('reservation_token', reservationToken);
      }
      await supabaseClient
        .from('products')
        .update({
          status: 'available',
          reserved_until: null,
          updated_at: new Date().toISOString()
        })
        .in('id', productIds)
        .eq('status', 'reserved');
      reservedInDb = false;
    } catch (rollbackErr) {
      console.error('[Rollback Error] No se pudo revertir la reserva tras fallo en MP:', rollbackErr);
    }
  };

  try {
    const TTL_MINUTES = 15;
    const nowDate = new Date();
    const expiresAt = new Date(nowDate.getTime() + TTL_MINUTES * 60 * 1000);

    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Reserva atómica en base de datos
    const { data: reservedProducts, error: reserveError } = await supabaseClient.rpc(
      'reserve_products_atomic',
      {
        p_product_ids: productIds,
        p_minutes: TTL_MINUTES
      }
    );

    if (reserveError || !reservedProducts || reservedProducts.length !== productIds.length) {
      console.warn('[Reservation Conflict] Reserva atómica rechazada:', reserveError?.message || 'Stock no disponible');
      return res.status(409).json({
        error: 'Una o más prendas están en proceso de compra por otro cliente, no existen o ya fueron vendidas.'
      });
    }

    reservedInDb = true;

    // 2. Generar token de posesión de reserva y persistir en product_reservations
    reservationToken = crypto.randomBytes(24).toString('hex');
    const reservationRows = productIds.map(pid => ({
      product_id: pid,
      reservation_token: reservationToken,
      reserved_until: expiresAt.toISOString(),
      ip_hash: hashIp(clientIp)
    }));

    const { error: tokenInsertError } = await supabaseClient
      .from('product_reservations')
      .insert(reservationRows);

    if (tokenInsertError) {
      console.error('[Reservation Token Error]:', tokenInsertError);
      // No bloquea el flujo si la tabla aún se está migrando, pero loguea la anomalía
    }

    // 3. Obtener tarifa de envío OFICIAL desde base de datos (Anti-tampering VULN-004)
    let validatedShippingCost = 0;
    let shippingName = 'Envío a Domicilio';

    if (shippingRegion) {
      const { data: rateData } = await supabaseClient
        .from('shipping_rates')
        .select('name, price, active')
        .eq('id', String(shippingRegion).trim())
        .single();

      if (rateData && rateData.active) {
        validatedShippingCost = Number(rateData.price) || 0;
        shippingName = String(rateData.name || shippingName);
      }
    }

    // 4. Mapear items con precios OFICIALES de la base de datos
    const mpItems = reservedProducts.map((p: { id: string; title: string; price: number }) => ({
      id: p.id,
      title: String(p.title || 'Prenda').slice(0, 120),
      unit_price: Number(p.price),
      quantity: 1,
      currency_id: 'ARS'
    }));

    if (validatedShippingCost > 0) {
      mpItems.push({
        id: 'shipping-rate',
        title: shippingName.slice(0, 120),
        unit_price: validatedShippingCost,
        quantity: 1,
        currency_id: 'ARS'
      });
    }

    // 5. Sanitización del pagador
    const cleanPayer = {
      name: String(payer?.name || 'Cliente').replace(/[<>\/\\=]/g, '').slice(0, 100),
      email: String(payer?.email || 'cliente@esven.com').trim().slice(0, 120),
      phone: {
        number: String(payer?.phone || '').replace(/[^0-9+\s-]/g, '').slice(0, 25)
      },
      address: {
        street_name: String(payer?.address || '').replace(/[<>\/\\=]/g, '').slice(0, 150),
        zip_code: String(payer?.postalCode || '').replace(/[^0-9a-zA-Z\s-]/g, '').slice(0, 15)
      }
    };

    // 6. Registrar la orden del lado del servidor (prevención de bypass)
    const orderCode = `ESV-${Date.now().toString().slice(-6)}`;
    const productsSubtotal = reservedProducts.reduce((sum: number, p: any) => sum + Number(p.price || 0), 0);
    const totalOrderAmount = productsSubtotal + validatedShippingCost;

    const { error: orderInsertError } = await supabaseClient
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_info: {
          name: cleanPayer.name,
          email: cleanPayer.email,
          phone: payer?.phone || ''
        },
        shipping_info: {
          address: payer?.address || '',
          postalCode: payer?.postalCode || '',
          province: payer?.province || '',
          service: shippingName,
          cost: validatedShippingCost
        },
        total_amount: totalOrderAmount,
        gateway: 'mercadopago',
        payment_status: 'pending',
        gateway_payment_id: null,
        items: reservedProducts.map((p: any) => ({
          id: p.id,
          name: p.title,
          price: Number(p.price),
          quantity: 1
        }))
      });

    if (orderInsertError) {
      console.warn('[Server Order Insert Warning]:', orderInsertError.message);
    }

    // 7. Crear preferencia en Mercado Pago
    const preferenceData = {
      items: mpItems,
      payer: cleanPayer,
      back_urls: {
        success: `${baseUrl}/?payment_status=success&order_code=${orderCode}`,
        failure: `${baseUrl}/?payment_status=failure&order_code=${orderCode}`,
        pending: `${baseUrl}/?payment_status=pending&order_code=${orderCode}`
      },
      auto_return: 'approved',
      statement_descriptor: 'ESVEN MODA CIRCULAR',
      external_reference: productIds.join(','),
      notification_url: `${baseUrl}/api/webhook`
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('[Mercado Pago API error]:', mpData);
      await rollbackReservation();
      return res.status(502).json({ error: 'Error comunicando con pasarela de pago' });
    }

    return res.status(200).json({
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
      reservationExpiresAt: expiresAt.toISOString(),
      reservedProductIds: productIds,
      reservationToken,
      orderCode
    });

  } catch (err: any) {
    console.error('[Security Exception] Error generando preferencia de pago:', err);
    await rollbackReservation();
    return res.status(500).json({ error: 'Error interno en el servidor de pagos' });
  }
}
