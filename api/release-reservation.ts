/**
 * Serverless API Route para liberar reservas temporales en Supabase
 * Compatible con Vercel Serverless Functions
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productIds } = req.body || {};

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'productIds es requerido y debe ser una lista' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ released: true, mode: 'local' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cleanIds = productIds.map(id => String(id).trim()).filter(Boolean);

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
