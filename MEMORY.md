# MEMORY — ESVEN / TIENDA DE ROPAS (CATÁLOGO RETAIL MOBILE-FIRST)

## 1. Identidad y Dominio del Producto
- **Nombre:** **ESVEN** (Unidad 03 de Icariel System — Moda Circular Vintage 1/1 y Catálogo Retail).
- **Fundador:** Guillermo.
- **Misión:** Catálogo de indumentaria digital de alta velocidad (<0.8s) optimizado para teléfonos móviles, piezas únicas (1/1), pasarela automatizada con Mercado Pago (reserva con TTL de 15 min y countdown) y soporte personalizado vía WhatsApp.
- **Ruta de Trabajo Local:** `C:\Users\Guille\proyectos-tienda\Tienda-de-ropas`
- **Control de Versiones:** Repositorio Git en rama `main`.

---

## 2. Pila Tecnológica & Arquitectura Modular
- **Framework:** React 19 + TypeScript (strict mode, 0 errores en `tsc --noEmit`).
- **Bundler:** Vite 8 (con Code Splitting automático y dynamic imports vía `React.lazy`).
- **Estilizado & UI:** Tailwind CSS v4 + Lucide React.
- **Backend Serverless:**
  - `api/create-preference.ts`: Bloqueo atómico con TTL de 15 min en Supabase y generación de preferencia en Mercado Pago.
  - `api/release-reservation.ts`: Endpoint de liberación voluntaria o por expiración de reservas temporales.
  - `api/webhook.ts`: Webhook IPN de Mercado Pago con validación HMAC-SHA256 (pase a `'sold'` o liberación a `'available'`).
- **Gestión de Estado (Custom Hooks):**
  - `src/hooks/useCart.ts`: Persistencia en `localStorage`, control de prenda única 1/1 y cálculo de totales.
  - `src/hooks/useCatalog.ts`: Consumo con Realtime Supabase, fail-safe estricto en producción (`mockCatalog` restringido a `DEV`) y manejo de errores.
  - `src/hooks/useCatalogFilters.ts`: Deducción dinámica de talles, orden y búsqueda con debounce.
  - `src/hooks/useDebounce.ts`: Prevención de cuellos de botella en inputs de búsqueda.
- **Servicios:**
  - `src/services/catalogService.ts`: Desbloqueo pasivo Just-in-Time (`release_expired_reservations`) y mapeo de estado con fail-safe.
  - `src/services/payment.ts`: Cliente de integración de preferencias y liberación de reservas para Mercado Pago.
  - `src/services/whatsapp.ts`: Sanitización y ensamblado de mensaje para `wa.me`.
- **Utilidades:**
  - `src/utils/formatters.ts`: Formateador singleton de precios (`Intl.NumberFormat`).
- **Modales & Drawers:** Carga perezosa (lazy-loaded chunks) para garantizar primera pintura FCP ultra veloz.
  - `CheckoutModal.tsx`: Vista dual con pantalla de espera, temporizador regresivo (`15:00`), enlace externo a Mercado Pago y botones de verificación/cancelación.
  - `ProductCard.tsx`: Badge sobrio `"En proceso de compra"` (sin etiquetas ámbar) y botón bloqueado temporalmente.

---

## 3. Gobernanza del Agente y Escuadrón de Subagentes
- **Orquestador Principal:** **Vision** (Tech Lead & E-commerce Architect). Ver directivas en [`governance/system_persona.md`](./governance/system_persona.md).
- **Escuadrón Técnico DevSecOps (`governance/subagents/`):**
  - **Viernes (`coder`):** Componentes React 19, TypeScript, Tailwind v4, LocalStorage y generador wa.me.
  - **Fury (`secops`):** Sanitización de inputs, integridad de enlaces y política DLP.
  - **Tony (`reviewer`):** Performance web (<0.8s), tipado estricto y buenas prácticas React.
  - **Rhodey (`visual_qa`):** Usabilidad Mobile-First, viewport 360-414px y touch targets.
  - **Wanda (`documenter`):** Memoria técnica (`LOG.md`, `MEMORY.md`) y notas en `G:\Mi unidad\Cerebro\raw\tienda-de-ropas\`.
- **Subagente de Dominio:**
  - **Merchandiser (`retail_stylist`):** Curva de talles, variantes de color, badges y formato de pedido WhatsApp.
- **Políticas de Seguridad:** Ver [`governance/guardrails_constraints.md`](./governance/guardrails_constraints.md).
