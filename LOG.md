# LOG DE EJECUCIÓN & BITÁCORA — TIENDA DE ROPAS

Este documento registra cronológicamente los hitos, refactorizaciones y avances de **Tienda de Ropas**.

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

### [2026-11-04 19:56] — Fase 2 Plan Producción: Checkout Seguro, Reserva Atómica & Webhooks MP
- **Motor de Reserva Atómica en Checkout:**
  - Creado `reserveProductsForCheckout` en `src/services/catalogService.ts`: Invoca el RPC `reserve_product_for_checkout` (10 minutos) con fallback tolerante en modo local.
  - Conectado a `src/components/CheckoutModal.tsx`: Verificación previa a la redirección de pago. Si otra persona reservó la prenda única, el usuario es notificado de inmediato.
  - Añadido badge de garantía de reserva en el formulario del modal de checkout.
- **Serverless API Routes & Webhook IPN de Mercado Pago:**
  - Actualizado `api/create-preference.ts`: Incluye `external_reference` con los IDs de las prendas y `notification_url` para sincronización de webhooks.
  - Actualizado `api/webhook.ts`: Verificación directa del pago en Mercado Pago y actualización atómica definitiva a estado `sold` en Supabase al confirmarse la compra.
- **Validación:** Build exitoso en 1.02s y verificación TypeScript limpia (`tsc --noEmit` con 0 errores).

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
