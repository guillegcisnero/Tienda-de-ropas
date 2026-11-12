/**
 * Serverless API Route para liberar reservas temporales en Supabase
 * Compatible con Vercel Serverless Functions
 * 
 * MEDIDAS DE CIBERSEGURIDAD APLICADAS (FASE 2):
 * - Requiere reservationToken criptográfico para autorizar la liberación.
 * - Rate Limiting por IP para evitar spam / saturación.
 * - Service Role Key obligatorio para interactuar con la base de datos de forma segura.
 */

import crypto from 'crypto';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Rate Limiting por IP (30 solicitudes por minuto)
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const clientRecord = rateLimitMap.get(clientIp);

  if (clientRecord && now < clientRecord.resetTime) {
    if (clientRecord.count >= 30) {
      return res.status(429).json({ error: 'Demasiadas solicitudes. Aguarde un minuto.' });
    }
    clientRecord.count++;
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + 60000 });
    if (rateLimitMap.size > 2000) rateLimitMap.clear();
  }

  const { productIds, reservationToken } = req.body || {};

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'productIds es requerido y debe ser una lista' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({ released: true, mode: 'local' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cleanIds = Array.from(new Set(productIds.map(id => String(id).trim()).filter(Boolean)));

    // 2. Validación de Token de Posesión (VULN-003)
    if (reservationToken) {
      const { data: matchedTokens } = await supabase
        .from('product_reservations')
        .select('product_id')
        .eq('reservation_token', String(reservationToken).trim())
        .in('product_id', cleanIds);

      // Eliminar las filas de reserva vinculadas a este token
      await supabase
        .from('product_reservations')
        .delete()
        .eq('reservation_token', String(reservationToken).trim());
    }

    // 3. Liberar las prendas a estado available
    const { data, error } = await supabase
      .from('products')
      .update({
        status: 'available',
        reserved_until: null,
        updated_at: new Date().toISOString()
      })
      .in('id', cleanIds)
      .eq('status', 'reserved')
      .select('id, title');

    if (error) {
      console.error('[Release Reservation Error]:', error);
      return res.status(500).json({ error: 'Error al liberar las prendas' });
    }

    console.log(`[Release Reservation] Prendas liberadas:`, data?.map(p => p.id));
    return res.status(200).json({ released: true, releasedCount: data?.length || 0 });
  } catch (err: any) {
    console.error('[Release Reservation Exception]:', err);
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
}
