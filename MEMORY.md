# MEMORY — TIENDA DE ROPAS (CATÁLOGO RETAIL MOBILE-FIRST)

## 1. Identidad y Dominio del Producto
- **Nombre:** **Tienda de Ropas / Catálogo Retail Al Toque Web**.
- **Misión:** Catálogo de indumentaria digital de alta velocidad (<0.8s) optimizado para teléfonos móviles, con carrito persistente y derivación de pedidos preformateados directo a WhatsApp (cero comisiones).
- **Ruta de Trabajo Local:** `C:\Users\Guille\proyectos-tienda\Tienda-de-ropas`
- **Control de Versiones:** Repositorio Git en rama `main`.

---

## 2. Pila Tecnológica & Arquitectura Modular
- **Framework:** React 19 + TypeScript.
- **Bundler:** Vite 8 (con Code Splitting automático y dynamic imports vía `React.lazy`).
- **Estilizado & UI:** Tailwind CSS v4 + Lucide React.
- **Gestión de Estado (Custom Hooks):**
  - `src/hooks/useCart.ts`: Persistencia en `localStorage`, control de prenda única 1/1 y cálculo de totales.
  - `src/hooks/useCatalogFilters.ts`: Deducción dinámica de talles, orden y búsqueda con debounce.
  - `src/hooks/useDebounce.ts`: Prevención de cuellos de botella en inputs de búsqueda.
- **Servicios:**
  - `src/services/whatsapp.ts`: Sanitización y ensamblado de mensaje para `wa.me`.
  - `src/services/payment.ts`: Cliente de integración de preferencias para Mercado Pago.
- **Utilidades:**
  - `src/utils/formatters.ts`: Formateador singleton de precios (`Intl.NumberFormat`).
- **Modales & Drawers:** Carga perezosa (lazy-loaded chunks) para garantizar primera pintura FCP ultra veloz.

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
