# ARQUITECTURA DE SUBAGENTES — TIENDA DE ROPAS (E-COMMERCE & CATÁLOGO MOBILE-FIRST)

Este directorio contiene las especificaciones de interfaz, límites operativos y contratos de entrada/salida de los subagentes especializados de **Tienda de Ropas**.

---

## 1. Principio de Segregación de Contexto y Mínimo Privilegio

El Orquestador Principal **Vision** (`governance/system_persona.md`) lidera la arquitectura del catálogo y delega el ciclo de vida en:
1. **Escuadrón Técnico DevSecOps (5 Fases):** `Viernes ➔ Fury ➔ Tony ➔ Rhodey ➔ Wanda`.
2. **Subagente de Dominio / Retail:** `Merchandiser` (Especialista en indumentaria, talles, variantes y formato de pedidos para WhatsApp).

---

## 2. Catálogo Oficial del Escuadrón

| Subagente | Rol | Modelo | Permisos y Herramientas | Archivo |
|---|---|---|---|---|
| **Viernes** (`coder`) | Implementador Frontend (React 19, TypeScript, Tailwind CSS v4, Motion, Carrito LocalStorage) | `flash` / `pro` | Escritura de código + Terminal | [`subagent_viernes_coder.md`](./subagent_viernes_coder.md) |
| **Fury** (`secops`) | Auditor de Seguridad Web, Sanitización de Inputs, Cero Fuga de Datos de Compradores (DLP) | `inherit` / `pro` | Lectura de código + Auditoría estática | [`subagent_fury_secops.md`](./subagent_fury_secops.md) |
| **Tony** (`reviewer`) | Revisor de Rendimiento Web (< 0.8s), Arquitectura de Componentes y Buenas Prácticas React | `inherit` / `pro` | Lectura de código + Linter | [`subagent_tony_reviewer.md`](./subagent_tony_reviewer.md) |
| **Rhodey** (`visual_qa`) | QA Visual Mobile-First, Touch Targets para Pulgar, Pruebas en Viewports 360px a 414px | `flash` / `inherit` | Chrome DevTools MCP | [`subagent_rhodey_qa.md`](./subagent_rhodey_qa.md) |
| **Wanda** (`documenter`) | Guardiana de memoria, actualización de `LOG.md`, `MEMORY.md` y notas en `raw/tienda-de-ropas/` | `flash_lite` / `flash` | Escritura en bitácoras y Cerebro | [`subagent_wanda_documenter.md`](./subagent_wanda_documenter.md) |
| **Merchandiser** (`retail_stylist`) | Especialista en Indumentaria, Gestión de Talles, Colores, Precios y Formateo a WhatsApp | `flash` | Catálogo de productos | [`subagent_merchandiser_fashion.md`](./subagent_merchandiser_fashion.md) |
