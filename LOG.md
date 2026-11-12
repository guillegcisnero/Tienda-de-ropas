# LOG DE EJECUCIÓN & BITÁCORA — TIENDA DE ROPAS

Este documento registra cronológicamente los hitos, refactorizaciones y avances de **Tienda de Ropas**.

---

### [2026-11-12 13:18] — Remediación de Seguridad Fase 3 (Blindaje de Autenticación, RLS Unificado y Revocaciones)
- **Base de Datos (`supabase_schema.sql`):**
  - RLS unificado en `public.products`, `public.orders`, `public.shipping_rates` y `storage.objects`: autorización por claim de Supabase Auth `(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')`, manteniendo compatibilidad con email autorizado y `service_role`.
  - Blindaje estricto en `public.revocations`: política pública de inserción asegurada con `WITH CHECK (status = 'solicitado' AND resolution_notes IS NULL)`, impidiendo que un atacante cree solicitudes marcadas como aprobadas o inyecte resoluciones apócrifas.
- **Frontend & Autenticación (`AdminDashboard.tsx`):**
  - Desactivado por completo el fallback de autenticación simulada ("demo bypass") en entornos de producción (`import.meta.env.PROD`).
- **Verificación:** `npm.cmd run lint` (`tsc --noEmit`) y `npm.cmd run build` ejecutados exitosamente con 0 errores.

---

### [2026-11-12 12:55] — Remediación de Seguridad Fase 2 (Envíos en DB, Tokens de Reserva y Pedidos WhatsApp Validados)
- **Base de Datos (`supabase_schema.sql`):**
  - Creada tabla privada `public.product_reservations` con RLS habilitado (sin políticas para anon/authenticated, exclusiva para `service_role`). Almacena tokens criptográficos de reserva por prenda con TTL e índice de búsqueda.
  - Creada tabla `public.shipping_rates` con catálogo inicial de tarifas (CABA, Interior, Cuyo/NOA/NEA, Patagonia, Retiro en punto). Políticas RLS: lectura pública (`SELECT`) y escritura restringida (`ALL`) para administradores autenticados o backend.
- **Serverless & Endpoints (`api/create-preference.ts`, `api/release-reservation.ts`, `api/create-whatsapp-order.ts`):**
  - `api/create-preference.ts`: generación de `reservationToken` criptográfico (24 bytes hex) guardado en `product_reservations`; consulta server-side del costo de envío oficial en `shipping_rates`; registro automático de la orden pendiente en `orders` con `service_role`.
  - `api/release-reservation.ts`: validación obligatoria de `reservationToken` para liberar únicamente las prendas del comprador respectivo, con rate limiting por IP.
  - `api/create-whatsapp-order.ts`: nuevo endpoint serverless que valida precios de prendas contra la DB, valida tarifas de envío en `shipping_rates`, registra la orden pendiente y genera la URL sanitizada de `wa.me`.
- **Frontend & Servicios (`src/`):**
  - `src/services/shippingService.ts`: servicio para consultar y actualizar tarifas desde Supabase con fallback local.
  - `src/services/whatsappOrderService.ts`: servicio para invocar `/api/create-whatsapp-order`.
  - `src/components/CheckoutModal.tsx`: cancelación y verificación de reservas ligadas al `reservationToken`; pedidos por WhatsApp validados por backend.
  - `src/components/CartDrawer.tsx` y `src/App.tsx`: soporte reactivo para tarifas dinámicas cargadas desde base de datos.
  - `src/components/admin/views/SettingsView.tsx`: sincronización automática de tarifas de envío hacia Supabase al guardar parámetros.
- **Verificación:** `npm.cmd run lint` (`tsc --noEmit`) y `npm.cmd run build` ejecutados exitosamente con 0 errores.

---

### [2026-11-12 09:45] — Remediación de Seguridad Fase 1 (Contención DB & Serverless Fail-Closed)
- **Base de Datos (`supabase_schema.sql`):**
  - Endurecida política RLS `"Public Insert Orders"` en `public.orders` exigiendo `payment_status = 'pending'` y `gateway_payment_id IS NULL` en inserciones públicas.
  - Restringido `reserve_product_for_checkout` (`p_minutes` acotado a `1..15`, `SET search_path = public, pg_temp`, `EXECUTE` revocado a `PUBLIC`/`anon`/`authenticated` y otorgado exclusivamente a `service_role`).
  - Creada RPC atómica multi-prenda `reserve_products_atomic` con bloqueo `FOR UPDATE` ordenado (solo `service_role`) y endurecido `release_expired_reservations` con `SET search_path = public, pg_temp`.
- **Serverless (`api/create-preference.ts`, `api/webhook.ts`, `.env.example`):**
  - `api/create-preference.ts`: fail-closed si faltan `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` o `APP_URL`/`VERCEL_URL` cuando `MERCADOPAGO_ACCESS_TOKEN` está activo; reserva atómica vía `reserve_products_atomic` con rollback automático si falla Mercado Pago; eliminado armado de `baseUrl` desde cabeceras `x-forwarded-host`/`host`.
  - `api/webhook.ts`: verificación HMAC obligatoria (fail-closed si falta `MERCADOPAGO_WEBHOOK_SECRET`), exigencia de `SUPABASE_SERVICE_ROLE_KEY`, idempotencia por `gateway_payment_id`, validación de moneda (`ARS`) y monto (`transaction_amount >= expectedProductsTotal`), y propagación de errores `500` ante fallos de actualización en Supabase.
  - `.env.example`: documentadas `APP_URL` y `SUPABASE_URL` en sección Backend Serverless.
- **Verificación:** `npm.cmd run lint` (`tsc --noEmit`) y `npm.cmd run build` ejecutados sin errores.

---

### [2026-11-08 23:20] — Implementación Integral de Arbitraje de Stock 1/1 y Checkout Seguro (Punto 4)
- **Fase 1 (Backend & Reserva Atómica / Fury & Viernes):**
  - Modificado `api/create-preference.ts`: implementado bloqueo atómico condicional en Supabase (`status = 'reserved'`, `reserved_until = NOW() + 15 min`) antes de invocar la API de Mercado Pago. Si una prenda no está disponible o tiene reserva vigente, responde 409 Conflict.
  - Creado `api/release-reservation.ts`: endpoint serverless para liberar prendas reservadas si el comprador cancela o expira el checkout.
  - Actualizado `api/webhook.ts`: libera prendas a `available` ante eventos `rejected` o `cancelled`, y consolida a `sold` con `reserved_until = null` al acreditarse el pago.
  - Actualizado `src/services/payment.ts`: interfaces tipadas con `reservationExpiresAt` y método `releasePaymentReservation`.
- **Fase 2 (Servicios & Fail-Safe / Tony & Viernes):**
  - Modificado `src/services/catalogService.ts`: desbloqueo pasivo Just-in-Time (`release_expired_reservations`) al leer el catálogo. Mapeo condicional de prendas cuya reserva superó los 15 min como `available = true`.
  - Fail-safe estricto para producción: `mockCatalog.ts` restringido a desarrollo local (`DEV`). En producción, si Supabase no está conectado o falla, devuelve estado de contingencia sin vender datos simulados.
  - Actualizado `src/hooks/useCatalog.ts`: estado inicial vacío en producción y propagación de errores de conexión.
- **Fase 3 (UI de Catálogo / Rhodey & Viernes):**
  - Actualizado `src/components/ProductCard.tsx`: badge minimalista y sobrio `"En proceso de compra"` (sin etiquetas ámbar) y botones de compra deshabilitados con cursor `not-allowed`.
  - Actualizado `src/components/ProductDetailModal.tsx`: estado reservado consistente en detalle y botones deshabilitados.
- **Fase 4 (Checkout con Countdown / Viernes & Rhodey):**
  - Modificado `src/components/CheckoutModal.tsx`: apertura de pasarela de Mercado Pago en nueva pestaña (`window.open(initPoint, '_blank')`) y despliegue inmediato de la pantalla de espera con temporizador regresivo (`15:00`).
  - Botón táctil para verificar acreditación (`handleCheckPaymentStatus`) y botón para liberar prendas voluntariamente (`handleCancelReservation`). Manejo de expiración con aviso al comprador.
- **Fase 5 (Auditoría & Compilación / Fury & Tony):**
  - 0 errores TypeScript (`npm.cmd run lint` -> `tsc --noEmit`).
  - Compilación de producción limpia (`npm.cmd run build` -> `dist/` generado en 1.73s).

---

### [2026-11-08 22:45] — Creación de GEMINI.md y Consolidación de Arquitectura Retail
- **Regla Raíz GEMINI.md Implementada:**
  - Creado [`GEMINI.md`](./GEMINI.md) como Fuente Operativa e Índice Ejecutivo del proyecto para Antigravity / Gemini CLI.
  - Formalizado el rol activo de **Vision** (Tech Lead & E-commerce Architect) y la identidad de marca **ESVEN** (Moda Circular Vintage 1/1).
  - Integrado el protocolo obligatorio para dilemas técnicos y decisiones de diseño (Opción A vs. Opción B + Recomendación de Vision).
  - Clarificada la arquitectura de stock 1/1: pasarela principal automática vía Mercado Pago (webhook HMAC-SHA256 con pase a `'sold'`), reserva temporal TTL con countdown visible en checkout, y canal WhatsApp para soporte y atención post-venta.
  - Formalizada la orquestación del escuadrón DevSecOps de 5 fases (`Viernes ➔ Fury ➔ Tony ➔ Rhodey ➔ Wanda`) más `Merchandiser`.
  - Blindaje legal ratificado: Botón de Arrepentimiento (Res. 424/2020), Garantía de 90 días en indumentaria usada (Ley 24.240) y Agotamiento Marcario.

---

### [2026-11-04 18:15] — Inicialización de Gobernanza y Escuadrón de Subagentes
- **Estructura de Gobernanza Creada:**
  - `governance/system_persona.md`: Orquestador Vision (E-commerce Lead & Retail Tech Architect).
  - `governance/guardrails_constraints.md`: Políticas de performance (<0.8s), Mobile-First, privacidad y Cerebro.
  - `governance/workflows_and_tools.md`: SOPs para `npm.cmd` en Windows y ciclo de desarrollo.
  - `governance/subagents/`: Catálogo completo con Viernes (Coder), Fury (SecOps), Tony (Reviewer), Rhodey (Visual QA), Wanda (Documenter) y Merchandiser (Retail & WhatsApp Orders).
- **Políticas de Bóveda Cerebro:** Inicializada la subcarpeta autorizada `G:\Mi unidad\Cerebro\raw\tienda-de-ropas\`.
- Creado `MEMORY.md` con la pila tecnológica, rutas de trabajo y directivas de e-commerce.

---

### [2026-11-04 19:12] — Refactorización Modular de Alta Eficiencia (Vision & DevSecOps Squad)
- **Desacoplamiento de Estado & Negocio:**
  - Creado `src/hooks/useCart.ts`: Aislamiento total de lógica de carrito, sincronización con `localStorage`, regla 1/1 y cálculo de subtotales memoizado.
  - Creado `src/hooks/useCatalogFilters.ts`: Gestión de filtros, deducción dinámica de talles disponibles a partir del catálogo y ordenamiento.
  - Creado `src/hooks/useDebounce.ts`: Debounce de 250ms para el campo de búsqueda evitando re-renders en cascada.
- **Servicios & Formateadores Centralizados:**
  - Creado `src/utils/formatters.ts`: Instancia singleton de `Intl.NumberFormat` eliminando la duplicación en 4 componentes.
  - Creado `src/services/whatsapp.ts`: Abstracción pura para armado y sanitización estricta (`encodeURIComponent`) del pedido a WhatsApp.
  - Creado `src/services/payment.ts`: Desacoplamiento de la llamada API a `/api/create-preference`.
- **Code Splitting & Reducción de Bundle Inicial:**
  - `App.tsx` ahora implementa `React.lazy` y `<Suspense>` para `ProductDetailModal`, `MeasurementsGuideModal`, `CartDrawer` y `CheckoutModal`.
  - Los 4 modales se descargan exclusivamente bajo demanda en chunks separados:
    - `MeasurementsGuideModal-*.js`: 3.85 kB
    - `ProductDetailModal-*.js`: 4.36 kB
    - `CartDrawer-*.js`: 5.76 kB
    - `CheckoutModal-*.js`: 7.62 kB
  - El bundle principal de JS se redujo a 254.16 kB (79.29 kB gzip).
- **Optimización de Renders (React.memo):**
  - `ProductCard.tsx`, `Hero.tsx`, `Footer.tsx` y `FiltersBar.tsx` envueltos en `React.memo` para evitar re-renders cuando el usuario tipea o navega.
- **Limpieza de Dependencias (`package.json`):**
  - Removidos paquetes no utilizados (`@google/genai`, `motion`, `express`, `dotenv`).
  - Movidas herramientas de build (`vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`) a `devDependencies`.
  - Corregido warning de Vite usando `import.meta.dirname`.
- **Validación:** Build exitoso en 968ms y TypeScript estricto verificado con 0 errores (`tsc --noEmit`).

---

### [2026-11-04 19:48] — Fase 1 Plan Producción: Conexión Híbrida Supabase & Realtime
- **Integración de Supabase SDK:**
  - Instalado `@supabase/supabase-js` con `--legacy-peer-deps`.
  - Creado `src/services/supabase.ts`: Instancia singleton y detector de estado `isSupabaseConfigured`.
  - Creado `src/services/catalogService.ts`: Mapeador de filas de base de datos a interfaz `Product` y fallback transparente a `MOCK_CATALOG`.
  - Creado `src/hooks/useCatalog.ts`: Hook reactivo que consume la API y se suscribe al canal WebSockets (`public:products`) de Supabase Realtime para actualizar la UI en vivo al registrar compras o reservas.
  - Integrado en `App.tsx`: Sustituido estado estático por `useCatalog()` con renderizado de skeleton loaders durante la carga inicial.
- **Esquema de Base de Datos & Población Inicial:**
  - Creado `supabase_schema.sql`: Script DDL completo con enums, tabla `products`, índices GIN para medidas JSONB, tabla `orders`, políticas RLS, función atómica `reserve_product_for_checkout` (bloqueo $Stock=1$) y seed data de catálogo.
  - Actualizado `.env.example` con las variables de producción para Supabase y pasarelas.
- **Validación:** Build exitoso en 1.06s y verificación TypeScript limpia (`tsc --noEmit` con 0 errores).

---

### [2026-11-04 23:50] — Rediseño Integral del Panel Administrador (Inspirado en Dribbble 25837591)
- **Fase 1: Infraestructura y Layout Base Modular:**
  - `src/components/admin/types.ts`: Tipos estrictos (`AdminSection`, `AdminOrder`, `DashboardStats`).
  - `src/components/admin/AdminSidebar.tsx`: Fondo Cocoa Dark (`#443530`), active pill en Cherry Accent (`#EA8A8A`), contador en vivo y botón de regreso a tienda.
  - `src/components/admin/AdminHeader.tsx`: Saludo horario dinámico, barra de búsqueda unificada, sync button, CTA de nueva prenda y avatar.
  - `src/components/admin/AdminLayout.tsx`: Orquestación responsiva (Sidebar lateral en desktop, slide-over drawer para mobile y bottom navigation bar con touch targets >= 44px).
- **Fase 2: Vista Dashboard Overview & Analítica SVG:**
  - `src/components/admin/components/StatCard.tsx`: Métricas ejecutivas (Ingresos, Catálogo, Pedidos, Ticket promedio) con sub-métricas (Hoy vs Mes) y variación %.
  - `src/components/admin/components/SalesTrendsChart.tsx`: Gráfico SVG nativo ultraligero con curvas spline Bézier en Cherry e Ivory, tooltips interactivos y toggle ventas/pedidos.
  - `src/components/admin/components/OrdersStatusDonut.tsx`: Donut chart SVG de distribución de inventario y pedidos.
  - `src/components/admin/views/DashboardOverview.tsx`: Ensamblado integral de KPIs, analítica gráfica y pedidos recientes.
- **Fase 3: Gestión de Inventario & Product Drawer:**
  - `src/components/admin/components/ProductDrawer.tsx`: Drawer lateral deslizable (Desktop 420-460px) y Bottom Sheet táctil (Mobile), con live preview de prenda, medidas en cm (sisa, largo, etc.), selector de condición vintage y soporte para Alta y Edición completa.
  - `src/components/admin/views/InventoryView.tsx`: Tabla estilizada con tarjetas de métricas de catálogo, filtros por categoría y disponibilidad, y toggle Live de estado.
  - `src/services/catalogService.ts`: Incorporación de `updateProduct()` para actualización de datos y persistencia en Supabase / local.
- **Fase 4: Pedidos Omnicanal & Configuración:**
  - `src/components/admin/views/OrdersView.tsx`: Listado omnicanal con filtros de pasarela (WhatsApp vs Mercado Pago), modal de detalle de compra, copia de etiquetas de logística y mensajes dinámicos `wa.me/` según estado.
  - `src/components/admin/views/SettingsView.tsx`: Edición reactiva y guardado en `localStorage` de parámetros de tienda, tarifas de envío, actualización de PIN administrativo y test de conexión con Supabase.
- **Fase 5: Optimización de Rendimiento, Seguridad y Validación:**
  - Protección con PIN configurable (`aura2026` / `admin` o PIN customizado).
  - Touch targets auditados y ajustados a >= 44px en toda la interfaz móvil.
  - Lazy loading respetado: `AdminDashboard` empaquetado en chunk independiente (`AdminDashboard-*.js` ~20 kB gzip), manteniendo el storefront en <0.8s.
  - Build de producción Vite completado exitosamente con 0 errores en 1.17s.

---


### [2026-11-04 19:59] — Fase 4 Plan Producción: Backoffice Móvil-First & Carga Express
- **Módulo Administrativo Lazy-Loaded (`AdminDashboard.tsx`):**
  - Creado `src/components/admin/AdminDashboard.tsx`: Panel completo con autenticación por PIN (`aura2026`), métricas de inventario (Total, Disponibles, Vendidas) y dos pestañas operativas.
  - Pestaña **Carga Express (&lt;60s)**: Formulario móvil-first con categorías, subcategorías, talles, condición de conservación y cotas de medidas en centímetros (`sisa`, `largo`, `cintura`, `manga/tiro`).
  - Pestaña **Gestión de Prendas**: Control visual de prendas con toggle directo de disponibilidad (`Disponible` / `Vendida`) y acción de baja/borrado.
  - Carga bajo demanda (`React.lazy`): Empaquetado en chunk independiente (`AdminDashboard-*.js` de 15.35 kB) sin aumentar el payload para clientes finales.
- **Servicios de Persistencia en Catálogo (`catalogService.ts`):**
  - Implementadas `createProduct`, `updateProductStatus` y `deleteProduct` con soporte bidireccional (PostgreSQL en Supabase o persistencia reactiva en local).
- **Navegación e Integración:**
  - Acceso directo mediante enlace discreto "Acceso Admin" en `Footer.tsx` o navegando a `#admin` en la URL.
- **Validación:** Build exitoso en 1.04s y chequeo estricto TypeScript limpio (`tsc --noEmit` con 0 errores).

---

### [2026-11-04 20:24] — Ajustes de UI en Filtros, Categorías & Botón Doble de Compra
- **Solución al Desbordamiento de Categorías (`FiltersBar.tsx`):**
  - Botones protegidos con `shrink-0` y `whitespace-nowrap` para evitar cortes en pantallas medianas y móviles.
  - Renombradas las categorías principales a:
    - **"Todas las prendas"**
    - **"Ropa para adultos"**
    - **"Ropa para niños"**
- **Filtro Dinámico de Sexo / Género:**
  - Añadido selector de sexos que se adapta a la categoría seleccionada (Mujer / Hombre para adultos; Nena / Nene para niños; Unisex para ambas).
  - Actualizado `useCatalogFilters.ts` y `mockCatalog.ts` con soporte para el campo `gender`.
- **Doble Botón de Acción ("Agregar al Carrito" e "Iniciar Compra"):**
  - **En `ProductCard.tsx`**: Botón "Agregar" (al carrito) y botón "Iniciar Compra" (checkout directo).
  - **En `ProductDetailModal.tsx`**: Dos botones horizontales destacados: "Agregar al Carrito" e "Iniciar Compra".
  - **En `CartDrawer.tsx`**: El botón principal ahora titula claramente "Iniciar Compra".
- **Validación:** HMR en caliente verificado, build de producción en 1.26s y `tsc --noEmit` con 0 errores.
