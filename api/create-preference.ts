/**
 * Serverless API Route para crear preferencia en Mercado Pago
 * Compatible con Vercel Serverless Functions (Node.js runtime)
 */

interface ItemPayload {
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
}

interface RequestBody {
  items: ItemPayload[];
  shippingCost?: number;
  payer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    province: string;
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, shippingCost, payer } = req.body as RequestBody;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Items requeridos' });
  }

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  // Si aún no está configurado el Access Token en variables de entorno, devolvemos fallback estructurado
  if (!mpAccessToken) {
    return res.status(200).json({
      status: 'simulated',
      message: 'Modo simulado activo. Configure MERCADOPAGO_ACCESS_TOKEN en Vercel para cobros reales.',
      init_point: null
    });
  }

  try {
    const mpItems = items.map(item => ({
      id: item.id,
      title: item.title,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity) || 1,
      currency_id: 'ARS'
    }));

    if (shippingCost && shippingCost > 0) {
      mpItems.push({
        id: 'shipping-rate',
        title: 'Costo de Envío a Domicilio',
        unit_price: Number(shippingCost),
        quantity: 1,
        currency_id: 'ARS'
      });
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}`;

    const preferenceData = {
      items: mpItems,
      payer: {
        name: payer?.name || 'Cliente',
        email: payer?.email || 'cliente@aurapreloved.com',
        phone: {
          number: payer?.phone || ''
        },
        address: {
          street_name: payer?.address || '',
          zip_code: payer?.postalCode || ''
        }
      },
      back_urls: {
        success: `${baseUrl}/?payment_status=success`,
        failure: `${baseUrl}/?payment_status=failure`,
        pending: `${baseUrl}/?payment_status=pending`
      },
      auto_return: 'approved',
      statement_descriptor: 'AURA PRELOVED'
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
      console.error('Mercado Pago API error:', mpData);
      return res.status(502).json({ error: 'Error comunicando con Mercado Pago', details: mpData });
    }

    return res.status(200).json({
      id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point
    });

  } catch (err: any) {
    console.error('Error generando preferencia de pago:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
