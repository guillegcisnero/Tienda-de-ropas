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
    created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Órdenes: Inserción permitida para checkout público sin exponer datos de terceros
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders
    FOR INSERT WITH CHECK (true);

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
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para acceso y subida pública de imágenes de catálogo
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Upload" ON storage.objects;
CREATE POLICY "Public Storage Upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
CREATE POLICY "Public Storage Update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'products');

-- 4.2 HABILITAR SUPABASE REALTIME (WEBSOCKETS)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
-- 9. TABLA DE REVOCACIONES Y ARREPENTIMIENTO (LEY 24.240 / RES. 424/2020)
-- Registro auditable de solicitudes del "Botón de Arrepentimiento"
-- ========================================================
CREATE TABLE IF NOT EXISTS public.revocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,                       -- Ej: 'REV-2026-A1B2'
    order_code TEXT NOT NULL,                        -- Código de orden vinculada
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    reason TEXT,                                     -- Motivo opcional del consumidor
    status TEXT NOT NULL DEFAULT 'solicitado',       -- 'solicitado', 'inspeccion_pendiente', 'aprobado', 'rechazado'
    resolution_notes TEXT,                           -- Notas internas de inspección
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de auditoría y búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_revocations_code ON public.revocations(code);
CREATE INDEX IF NOT EXISTS idx_revocations_order_code ON public.revocations(order_code);
CREATE INDEX IF NOT EXISTS idx_revocations_created_at ON public.revocations(created_at DESC);

-- Políticas de Seguridad (RLS) para proteger los datos personales (Ley 25.326)
ALTER TABLE public.revocations ENABLE ROW LEVEL SECURITY;

-- Los clientes pueden registrar su solicitud de arrepentimiento de forma anónima/pública (Res. 424/2020 no permite exigir login previo)
CREATE POLICY "Permitir inserción pública de solicitudes de arrepentimiento"
    ON public.revocations
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Solo el administrador autorizado puede consultar o modificar solicitudes de arrepentimiento
DROP POLICY IF EXISTS "Lectura restringida de revocaciones para administradores" ON public.revocations;
CREATE POLICY "Lectura restringida de revocaciones para administradores"
    ON public.revocations
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Actualización restringida de revocaciones para administradores" ON public.revocations;
CREATE POLICY "Actualización restringida de revocaciones para administradores"
    ON public.revocations
    FOR UPDATE
    TO authenticated
    USING (
        auth.jwt() ->> 'email' = 'guillegcisnero@gmail.com' 
        OR auth.role() = 'service_role'
    );

