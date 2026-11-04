# GUARDRAILS & PROTOCOLOS DE SEGURIDAD — TIENDA DE ROPAS

## 1. Reglas de Experiencia Móvil & Performance
- **Velocidad de Carga Obligatoria:** El tiempo hasta la primera pintura con contenido (FCP) debe ser inferior a 0.8s en conexiones estándar. Prohibido añadir librerías pesadas sin análisis de bundle size.
- **Formato de Medios:** Todas las imágenes de prendas deben cargarse optimizadas en WebP o AVIF con compresión visual sin pérdidas y dimensiones fijas para evitar CLS.
- **Diseño Ergonómico:** Todo elemento interactivo crucial (botones de compra, selección de talle, checkout) debe tener una zona táctil mínima de 44x44px.

---

## 2. Privacidad y Cero Fuga de Datos (DLP)
- **Cero Datos Sensibles:** No solicitar números de tarjeta de crédito, CVV o claves de usuario. Toda confirmación de pago se efectúa mediante transferencia bancaria o WhatsApp directo entre comerciante y comprador.
- **Sanitización de Inputs:** Nombres y comentarios del carrito deben sanitizarse antes de incrustarse en URLs de `https://wa.me/` para evitar ataques de redirección o Cross-Site Scripting (XSS).

---

## 3. Integración con WhatsApp
- El número de destino y el prefijo de país deben centralizarse en la configuración global y validarse con regex numérico internacional (`+549...`).
- Los textos del carrito deben codificarse con `encodeURIComponent` para garantizar su correcta visualización en WhatsApp Web y móvil.

---

## 4. Regla Universal de Bóveda Cerebro (Obsidian)
- **Directiva Inviolable:** Ningún script ni agente de Tienda de Ropas tiene autorización para modificar, crear o escribir archivos dentro de las wikis de Obsidian Cerebro (`Wiki_me/`, `wiki_tech/`, etc.). 
- **Subcarpeta Autorizada:** Toda documentación o snapshot técnico destinado a Cerebro debe guardarse obligatoria y exclusivamente dentro de la subcarpeta dedicada: `G:\Mi unidad\Cerebro\raw\tienda-de-ropas\`.
- **Nomenclatura:** `RAW_TIENDA_ROPAS_<TITULO>_<FECHA>.md`.
