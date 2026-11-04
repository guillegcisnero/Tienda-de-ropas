-- ========================================================
-- ESQUEMA OFICIAL SUPABASE — TIENDA PRE-LOVED
-- Compatible con PostgreSQL 15+ en Supabase Cloud
-- ========================================================

-- 1. TIPOS ENUMERADOS
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('available', 'reserved', 'sold', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_condition AS ENUM ('new_with_tags', 'like_new', 'excellent', 'vintage_good');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA DE PRODUCTOS (PRENDAS ÚNICAS)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,              -- 'Urbana', 'Infantil', etc.
    sub_category TEXT,                   -- 'Camperas', 'Buzos & Hoodies', etc.
    brand TEXT,
    size TEXT NOT NULL,                  -- 'Oversize M', 'Talle 2', etc.
    measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
    condition TEXT NOT NULL,             -- Ej: '9/10 (Excelente)'
    condition_notes TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_price NUMERIC(10, 2),
    weight_grams INTEGER DEFAULT 400,
    images TEXT[] NOT NULL DEFAULT '{}',
    is_single_piece BOOLEAN NOT NULL DEFAULT true,
    status product_status NOT NULL DEFAULT 'available',
    reserved_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de alto rendimiento para filtrado
CREATE INDEX IF NOT EXISTS idx_products_status_category ON public.products(status, category);
CREATE INDEX IF NOT EXISTS idx_products_size ON public.products(size);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_measurements ON public.products USING GIN (measurements);

-- 3. TABLA DE ÓRDENES COMERCIALES
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    customer_info JSONB NOT NULL,
    shipping_info JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    gateway TEXT NOT NULL,               -- 'mercadopago' | 'whatsapp'
    gateway_payment_id TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Catálogo: lectura pública para prendas disponibles o en reserva temporal
DROP POLICY IF EXISTS "Public Read Available Products" ON public.products;
CREATE POLICY "Public Read Available Products" ON public.products
    FOR SELECT USING (status IN ('available', 'reserved'));

-- Modificación de productos restringida a administradores autenticados
DROP POLICY IF EXISTS "Admin Full Products Access" ON public.products;
CREATE POLICY "Admin Full Products Access" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Inserción de órdenes permitida para el checkout público
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- 5. FUNCIÓN ATÓMICA DE RESERVA (STOCK = 1 SIN RACE CONDITIONS)
CREATE OR REPLACE FUNCTION reserve_product_for_checkout(
    p_product_id TEXT, 
    p_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN;
BEGIN
    UPDATE public.products
    SET 
        status = 'reserved',
        reserved_until = NOW() + (p_minutes || ' minutes')::INTERVAL,
        updated_at = NOW()
    WHERE id = p_product_id 
      AND status = 'available';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RUTINA PARA DESBLOQUEAR RESERVAS EXPIRADAS
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.products
    SET 
        status = 'available',
        reserved_until = NULL,
        updated_at = NOW()
    WHERE status = 'reserved' 
      AND reserved_until < NOW();
      
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. SEED DATA (POBLACIÓN INICIAL CON PRENDAS DEL CATÁLOGO)
INSERT INTO public.products (
    id, slug, title, category, sub_category, condition, size, measurements, description, price, weight_grams, images, is_single_piece, status
) VALUES 
(
    'prod-001',
    'campera-denim-vintage-90s',
    'Campera Denim Vintage 90s',
    'Urbana',
    'Camperas',
    '9/10 (Excelente)',
    'Oversize M',
    '{"sisa": "54 cm", "largo": "62 cm", "manga": "58 cm", "hombros": "48 cm"}'::jsonb,
    'Denim rígido 100% algodón lavado vintage original de los 90s. Botones metálicos de época y costuras reforzadas intactas.',
    28500,
    750,
    ARRAY['https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80'],
    true,
    'available'
),
(
    'prod-002',
    'enterito-jardinero-corduroy-mostaza',
    'Enterito Jardinero Corduroy Mostaza',
    'Infantil',
    'Bebés & Niños',
    '10/10 (Sin uso con etiqueta)',
    'Talle 2 (24 Meses)',
    '{"sisa": "31 cm", "largo": "68 cm", "tiro": "24 cm", "cintura": "33 cm"}'::jsonb,
    'Pana acanalada suave color mostaza cálido. Broches metálicos ajustables en tirantes y broches en entrepierna para fácil cambiado.',
    17500,
    300,
    ARRAY['https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop&q=80'],
    true,
    'available'
),
(
    'prod-003',
    'buzo-hoodie-oversize-washed-lilac',
    'Buzo Hoodie Oversize Washed Lilac',
    'Urbana',
    'Buzos & Hoodies',
    '9/10 (Excelente)',
    'Talle L',
    '{"sisa": "60 cm", "largo": "70 cm", "manga": "62 cm"}'::jsonb,
    'Frisa de algodón pesada con teñido artesanal desgastado. Capucha doble con cordón de ajuste de algodón crudo.',
    24000,
    650,
    ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'],
    true,
    'available'
),
(
    'prod-004',
    'cardigan-tejido-motas-nordico',
    'Cardigan Tejido Motas Nórdico',
    'Infantil',
    'Tejidos',
    '10/10 (Como nuevo)',
    'Talle 4 Años',
    '{"sisa": "36 cm", "largo": "42 cm", "manga": "35 cm"}'::jsonb,
    'Hilado hipoalergénico dralón suave con punto popcorn/motas en relieve. Botones de madera natural.',
    19800,
    280,
    ARRAY['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80'],
    true,
    'available'
),
(
    'prod-005',
    'pantalon-carpenter-wide-leg',
    'Pantalón Carpenter Wide Leg Arena',
    'Urbana',
    'Pantalones',
    '9.5/10 (Impecable)',
    'Talle 40 (30 US)',
    '{"cintura": "40 cm", "cadera": "52 cm", "largo": "104 cm", "tiro": "31 cm", "bota": "24 cm"}'::jsonb,
    'Gabardina pesada 100% algodón color arena. Bolsillo lateral utilitario y presilla para martillo.',
    26500,
    580,
    ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80'],
    true,
    'available'
),
(
    'prod-006',
    'vestido-lino-vintage-floral',
    'Vestido Midi Lino Botánico',
    'Urbana',
    'Vestidos',
    '9/10 (Excelente)',
    'Talle S/M',
    '{"sisa": "44 cm", "cintura": "38 cm", "largo": "112 cm"}'::jsonb,
    'Lino con mezcla de rayón para hermosa caída. Botones frontales de nácar y estampa floral botánica en tonos oliva y terracota.',
    29900,
    340,
    ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80'],
    true,
    'available'
)
ON CONFLICT (id) DO NOTHING;
