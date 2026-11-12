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
    category TEXT NOT NULL,              -- 'adultos', 'infantil', etc.
    sub_category TEXT,                   -- 'Camperas', 'Buzos & Hoodies', etc.
    gender TEXT,                         -- 'unisex', 'mujer', 'hombre', 'ninos', etc.
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_positive_total CHECK (total_amount >= 0),
    CONSTRAINT check_valid_gateway CHECK (gateway IN ('mercadopago', 'whatsapp')),
    CONSTRAINT check_valid_payment_status CHECK (payment_status IN ('pending', 'approved', 'paid', 'cancelled', 'rejected'))
);

-- 3.1 TABLA DE FAVORITOS (WISHLIST DE USUARIOS)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ========================================================
-- 4. ROW LEVEL SECURITY (RLS) — CONFORME A RES. AAIP 47/2018 & LEY 25.326
-- Confidencialidad e Integridad de Datos Personales
-- ========================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Catálogo: lectura pública para prendas disponibles, reservadas o vendidas
DROP POLICY IF EXISTS "Public Read Available Products" ON public.products;
CREATE POLICY "Public Read Available Products" ON public.products
    FOR SELECT USING (status IN ('available', 'reserved', 'sold'));

-- Modificación de productos: restringida exclusivamente al administrador autorizado
DROP POLICY IF EXISTS "Admin Full Products Access" ON public.products;
CREATE POLICY "Admin Full Products Access" ON public.products
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
        OR auth.role() = 'service_role'
    );

-- Favoritos: cada usuario administra y visualiza única y exclusivamente sus propios favoritos
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Órdenes: Inserción permitida para checkout con validación estricta de estructura y estado inicial
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders
    FOR INSERT WITH CHECK (
        total_amount >= 0 AND
        gateway IN ('mercadopago', 'whatsapp') AND
        payment_status = 'pending' AND
        gateway_payment_id IS NULL AND
        jsonb_typeof(items) = 'array'
    );

-- Órdenes: Lectura y gestión restringida estrictamente al administrador (prohibido a la anon key pública)
DROP POLICY IF EXISTS "Admin Read Orders" ON public.orders;
CREATE POLICY "Admin Read Orders" ON public.orders
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Admin Manage Orders" ON public.orders;
CREATE POLICY "Admin Manage Orders" ON public.orders
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
        OR auth.role() = 'service_role'
    );

-- 4.1 BUCKET DE FOTOS DE PRENDAS (STORAGE)
-- Bucket público para lectura de imágenes, con permisos de escritura restringidos a admin
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Lectura pública de imágenes de productos del catálogo
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

-- REGLAS DE SEGURIDAD ESTRICTAS (Cero permisos anónimos de modificación/borrado)
DROP POLICY IF EXISTS "Public Storage Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;

DROP POLICY IF EXISTS "Admin Storage Upload" ON storage.objects;
CREATE POLICY "Admin Storage Upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'products' AND (
            auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
            OR auth.role() = 'service_role'
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin Storage Update" ON storage.objects;
CREATE POLICY "Admin Storage Update" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'products' AND (
            auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
            OR auth.role() = 'service_role'
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin Storage Delete" ON storage.objects;
CREATE POLICY "Admin Storage Delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'products' AND (
            auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
            OR auth.role() = 'service_role'
            OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        )
    );

-- 4.2 HABILITAR SUPABASE REALTIME (WEBSOCKETS)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. FUNCIÓN ATÓMICA DE RESERVA (STOCK = 1 SIN RACE CONDITIONS — SOLO SERVICE ROLE)
CREATE OR REPLACE FUNCTION public.reserve_product_for_checkout(
    p_product_id TEXT, 
    p_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF p_minutes IS NULL OR p_minutes < 1 OR p_minutes > 15 THEN
        RAISE EXCEPTION 'p_minutes debe estar entre 1 y 15';
    END IF;

    UPDATE public.products
    SET 
        status = 'reserved',
        reserved_until = NOW() + make_interval(mins => p_minutes),
        updated_at = NOW()
    WHERE id = p_product_id 
      AND (
          status = 'available'
          OR (status = 'reserved' AND reserved_until < NOW())
      );
    
    RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_product_for_checkout(TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reserve_product_for_checkout(TEXT, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_product_for_checkout(TEXT, INTEGER) TO service_role;

-- 5.1 FUNCIÓN ATÓMICA EN LOTE PARA CHECKOUT MULTI-PRENDA (CON FOR UPDATE)
CREATE OR REPLACE FUNCTION public.reserve_products_atomic(
    p_product_ids TEXT[],
    p_minutes INTEGER DEFAULT 15
)
RETURNS TABLE (id TEXT, title TEXT, price NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_unique_ids TEXT[];
    v_expected_count INTEGER;
    v_locked_count INTEGER;
    v_unavailable_count INTEGER;
BEGIN
    IF p_minutes IS NULL OR p_minutes < 1 OR p_minutes > 15 THEN
        RAISE EXCEPTION 'p_minutes debe estar entre 1 y 15';
    END IF;

    SELECT ARRAY(
        SELECT DISTINCT trim(x)
        FROM unnest(p_product_ids) AS x
        WHERE trim(x) <> ''
        ORDER BY 1
    ) INTO v_unique_ids;

    v_expected_count := COALESCE(array_length(v_unique_ids, 1), 0);
    IF v_expected_count = 0 THEN
        RAISE EXCEPTION 'Se requiere al menos un product_id válido';
    END IF;

    -- Bloqueo pesimista en orden determinístico para prevenir deadlocks y TOCTOU
    SELECT
        COUNT(*),
        COUNT(*) FILTER (
            WHERE NOT (
                p.status = 'available'
                OR (p.status = 'reserved' AND p.reserved_until < NOW())
            )
        )
    INTO v_locked_count, v_unavailable_count
    FROM (
        SELECT p.id, p.status, p.reserved_until
        FROM public.products p
        WHERE p.id = ANY(v_unique_ids)
        ORDER BY p.id
        FOR UPDATE
    ) p;

    IF v_locked_count <> v_expected_count THEN
        RAISE EXCEPTION 'Una o más prendas solicitadas no existen';
    END IF;

    IF v_unavailable_count > 0 THEN
        RAISE EXCEPTION 'Una o más prendas ya están reservadas o vendidas';
    END IF;

    RETURN QUERY
    UPDATE public.products p
    SET
        status = 'reserved',
        reserved_until = NOW() + make_interval(mins => p_minutes),
        updated_at = NOW()
    WHERE p.id = ANY(v_unique_ids)
    RETURNING p.id, p.title, p.price;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_products_atomic(TEXT[], INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reserve_products_atomic(TEXT[], INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_products_atomic(TEXT[], INTEGER) TO service_role;

-- 6. RUTINA PARA DESBLOQUEAR RESERVAS EXPIRADAS
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- 7. SEED DATA (Desactivado para inicio con catálogo 100% limpio)
-- Para sembrar prendas de prueba, descomentar el bloque siguiente:
/*
INSERT INTO public.products (
    id, slug, title, category, sub_category, condition, size, measurements, description, price, weight_grams, images, is_single_piece, status
) VALUES 
...
ON CONFLICT (id) DO NOTHING;
*/

-- ========================================================
-- 10. TABLA DE RESERVAS CON TOKEN DE PROPIEDAD (FASE 2)
-- Mitiga VULN-003: Cada reserva genera un token criptográfico
-- solo el poseedor del token o service_role puede liberarla.
-- ========================================================
CREATE TABLE IF NOT EXISTS public.product_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    reservation_token TEXT NOT NULL,
    reserved_until TIMESTAMPTZ NOT NULL,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reservations_token ON public.product_reservations(reservation_token);
CREATE INDEX IF NOT EXISTS idx_product_reservations_product ON public.product_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reservations_until ON public.product_reservations(reserved_until);

ALTER TABLE public.product_reservations ENABLE ROW LEVEL SECURITY;
-- Tabla 100% privada: no se definen políticas para anon ni authenticated.
-- Solo service_role tiene acceso backend.

-- ========================================================
-- 11. TABLA DE TARIFAS DE ENVÍO OFICIALES (FASE 2)
-- Mitiga VULN-004: Fuente de verdad de envíos en base de datos.
-- ========================================================
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id TEXT PRIMARY KEY,                       -- Ej: 'cabaGba', 'centro', 'cuyoNoaNea', 'patagonia', 'pickup'
    name TEXT NOT NULL,                        -- Ej: 'CABA / GBA - Correo Argentino'
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    days TEXT NOT NULL,                        -- Ej: '24 a 48 hs hábiles'
    active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- Catálogo de envíos legible públicamente
DROP POLICY IF EXISTS "Public Read Shipping Rates" ON public.shipping_rates;
CREATE POLICY "Public Read Shipping Rates"
    ON public.shipping_rates
    FOR SELECT
    TO public
    USING (true);

-- Modificación solo para administradores autenticados o backend
DROP POLICY IF EXISTS "Admin Manage Shipping Rates" ON public.shipping_rates;
CREATE POLICY "Admin Manage Shipping Rates"
    ON public.shipping_rates
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com'
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com'
        OR auth.role() = 'service_role'
    );

-- Semilla inicial de tarifas
INSERT INTO public.shipping_rates (id, name, price, days, active)
VALUES 
    ('cabaGba', 'CABA / GBA - Correo Argentino', 3500, '24 a 48 hs hábiles', true),
    ('centro', 'Buenos Aires Interior / Córdoba / Santa Fe', 5200, '2 a 4 días hábiles', true),
    ('cuyoNoaNea', 'Cuyo, NOA y NEA', 6800, '3 a 5 días hábiles', true),
    ('patagonia', 'Patagonia Argentina', 8200, '4 a 6 días hábiles', true),
    ('pickup', 'Retiro en punto de encuentro (Lanús / CABA)', 0, 'A coordinar gratis', true)
ON CONFLICT (id) DO UPDATE
SET 
    name = EXCLUDED.name,
    days = EXCLUDED.days,
    updated_at = NOW();

