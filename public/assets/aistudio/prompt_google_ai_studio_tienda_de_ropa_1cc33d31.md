# ROL Y ARQUITECTURA
- Actúas como un Ingeniero Full-Stack y Diseñador UI/UX Senior especializado en comercio electrónico.
- Entorno de destino: Plantilla web profesional, interactiva y desacoplada (Single Page Application) en un único archivo autocontenido (`index.html`).
- Stack técnico: HTML5 semántico, Tailwind CSS (vía CDN con configuración extendida en script), Vanilla JavaScript moderno (ES6+) e iconos SVG/Lucide.
- Arquitectura Frontend-First Desacoplada: La aplicación funciona 100% de manera autónoma en modo demostración/estático (con mocks locales y cálculo de envíos por zonas preconfiguradas), pero deja programados e implementados los clientes HTTP (`fetch`) y esquemas de datos JSON exactos para conectarse sin refactorizar a un backend externo (Node.js, Express, Supabase, Cloudflare Workers o similar).
- Nicho de negocio: Tienda de indumentaria infantil y moda urbana sustentable / segunda mano (pre-loved, prendas únicas).

# OBJETIVO PRINCIPAL
Diseñar y escribir el código fuente completo, autocontenido y listo para usar de una plantilla e-commerce funcional. Debe incorporar:
1. Configuración centralizada (`STORE_CONFIG`) con flags de activación de backend, endpoints y credenciales.
2. Contratos de API claramente definidos para Catálogo, Cotización de Envíos (Andreani/OCA/Correo) y Pasarela (Mercado Pago).
3. Paleta cromática específica con fondo oscuro Cocoa Manor.
4. Reglas de negocio de segunda mano: **Prenda Única (stock máximo = 1 por ítem)** y ficha con medidas exactas en centímetros.
5. Carrito persistente con confirmación para vaciar el carrito.
6. Cotizador de envíos con selector de provincias argentinas (tarifa plana/zonas simuladas con fallback + hook para API de logística).
7. Checkout dual: Botón de Mercado Pago (preparado para recibir `preferenceId` de backend) y pedido estructurado para WhatsApp.

# IDENTIDAD VISUAL Y PALETA DE COLORES
Configura la extensión de Tailwind CSS (`tailwind.config`) con los siguientes tokens exactos:
- Fondo principal: Cocoa Manor (`#68544d` como tono base `bg-cocoa`). Todo el fondo del sitio debe ser este tono cálido oscuro.
- Acentos y botones interactivos: Cherry Blossom (`#EA8A8A`).
- Tarjetas, modales y superficies de alto contraste: Ivory Petal (`#EBD5D5`).
- Textos:
  - Sobre fondo Cocoa: textos claros en Ivory Petal y blanco roto.
  - Sobre tarjetas Ivory Petal: tipografía oscura (#2c221e) para legibilidad y accesibilidad AA.

# CONFIGURACIÓN CENTRALIZADA Y ENDPOINTS (STORE_CONFIG)
En la cabecera del script JavaScript, define el objeto global `STORE_CONFIG` editable y desacoplado:

```javascript
const STORE_CONFIG = {
  storeName: "Aura Pre-Loved",
  logoUrl: "", // URL de imagen o vacío para fallback tipográfico/SVG
  whatsappNumber: "5491100000000",
  currency: "$",
  
  // Conectores y endpoints de backend
  apiEndpoints: {
    useBackendCatalog: false, // true = consume catalogUrl; false = usa catálogo mock local
    catalogUrl: "https://api.tutienda.com/v1/products",
    
    useBackendShipping: false, // true = consulta cotización en vivo; false = usa tabla local
    shippingQuoteUrl: "https://api.tutienda.com/v1/shipping/quote", // Hook Andreani / Correo Arg
    
    useBackendPayments: false, // true = pide preferenceId al backend; false = modo guiado/manual
    createPreferenceUrl: "https://api.tutienda.com/v1/payments/create-preference" // Backend Mercado Pago
  },

  // Credenciales públicas directas
  mercadoPago: {
    publicKey: "TEST-00000000-0000-0000-0000-000000000000"
  },

  // Tarifas de envío simuladas por región (Modo offline / Fallback)
  shippingRates: {
    cabaGba: { name: "CABA / GBA", price: 3500 },
    centro: { name: "Buenos Aires Interior / Córdoba / Santa Fe", price: 5200 },
    cuyoNoaNea: { name: "Cuyo, NOA y NEA", price: 6800 },
    patagonia: { name: "Patagonia", price: 8200 },
    pickup: { name: "Retiro en punto de encuentro (Gratis)", price: 0 }
  }
};
```

# CONTRATOS DE API Y ESQUEMAS DE DATOS (BACKEND READY)
El código JavaScript del frontend debe contener funciones de fetch preparadas que esperen y procesen las siguientes estructuras JSON:

### 1. Endpoint Catálogo (`GET /v1/products`)
El frontend debe contemplar esta estructura de respuesta:
```json
{
  "products": [
    {
      "id": "prod-001",
      "name": "Campera Denim Vintage 90s",
      "category": "Urbana",
      "subCategory": "Camperas",
      "condition": "9/10 (Excelente)",
      "size": "Oversize M",
      "measurements": {
        "sisa": "54 cm",
        "largo": "62 cm",
        "manga": "58 cm"
      },
      "price": 28500,
      "image": "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80",
      "isSinglePiece": true,
      "available": true
    }
  ]
}
```

### 2. Endpoint Cotización de Envíos (`POST /v1/shipping/quote`)
- **Payload enviado por el frontend**:
  ```json
  {
    "province": "Córdoba",
    "postalCode": "5000",
    "cartItems": [{ "id": "prod-001", "weightGrams": 450 }]
  }
  ```
- **Respuesta esperada procesada por el frontend**:
  ```json
  {
    "service": "Correo Argentino Clásico",
    "cost": 5400,
    "estimatedDays": "3 a 5 días hábiles"
  }
  ```
*(Si `useBackendShipping` es false o la petición falla, debe ejecutarse un fallback limpio a `STORE_CONFIG.shippingRates`).*

### 3. Endpoint Creación de Preferencia Mercado Pago (`POST /v1/payments/create-preference`)
- **Payload enviado por el frontend**:
  ```json
  {
    "items": [
      {
        "id": "prod-001",
        "title": "Campera Denim Vintage 90s",
        "quantity": 1,
        "unit_price": 28500
      }
    ],
    "shippingCost": 5400,
    "payer": {
      "name": "Juan Perez",
      "email": "juan@example.com",
      "phone": "1123456789",
      "address": "Av. Colón 1234, Córdoba"
    }
  }
  ```
- **Respuesta esperada por el frontend**:
  ```json
  {
    "preferenceId": "123456789-abc-xyz",
    "initPoint": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
  }
  ```

# REQUERIMIENTOS TÉCNICOS Y FUNCIONALES

### 1. Catálogo y Reglas de Segunda Mano (Mock Data Inicial)
- Mínimo 8 productos iniciales que alternen entre **Moda Infantil** y **Moda Urbana**.
- Cumplir rigurosamente con los campos descritos en el esquema JSON de catálogo (incluyendo condición, talle infantil/urbano y medidas reales en centímetros).

### 2. Regla Crítica: Stock Unitario (Prenda Única)
- En segunda mano cada prenda es irrepetible.
- Al agregar un producto al carrito, la cantidad queda fija en **1**. No permitir incrementar a 2 o más.
- Si el usuario intenta agregar un ítem ya presente, mostrar un toast o aviso: *"Esta es una prenda única y ya se encuentra en tu carrito"*.
- En el catálogo, los botones de los ítems ya añadidos deben deshabilitarse con la leyenda *"En tu carrito"*.

### 3. Interfaz y Componentes
- **Navbar Sticky**:
  - Renderizado dinámico de logo o nombre desde `STORE_CONFIG`.
  - Buscador predictivo en tiempo real por texto (nombre, categoría, talle).
  - Botón de carrito con contador badge animado.
- **Hero / Banner**:
  - Estética editorial vintage sustentable con fondo Cocoa Manor y tipografía en Ivory Petal.
  - Botón CTA con scroll suave al catálogo.
- **Barra de Filtros**:
  - Filtro por categoría: Infantil, Urbana, Todos.
  - Filtro por Talle.
  - Filtro por Estado (10/10, 9/10, 8/10).
  - Ordenar por: Menor precio, Mayor precio, Más recientes.
- **Grid de Tarjetas**:
  - Tarjetas en Ivory Petal con tipografía oscura.
  - Badges visuales: "Prenda Única", Condición de la prenda y Talle.
  - Botón "Ver Ficha y Medidas" y botón "Agregar al Carrito".
- **Modal de Detalle / Ficha Técnica**:
  - Imagen en alta resolución.
  - Tabla explícita de **Medidas en Centímetros** (Sisa/Ancho, Largo total, Mangas/Cintura) para que el comprador verifique el calce antes de comprar.
  - Descripción de tela, composición y estado de conservación.
- **Drawer Lateral de Carrito**:
  - Listado de prendas únicas seleccionadas.
  - Subtotal en tiempo real.
  - **Botón "Vaciar Carrito"**: Al pulsarlo, debe abrir un modal de confirmación (*"¿Estás seguro de vaciar el carrito? Las prendas volverán a estar disponibles en la tienda"*).
  - Botón "Iniciar Compra" que abre el modal de checkout.
  - Persistencia total en `localStorage` con bloque `try/catch`.

### 4. Checkout con Selector de Provincias y Cotización de Envíos
- Modal de checkout con formulario completo:
  - Nombre y apellido, Teléfono, Email.
  - **Selector de Tipo de Entrega**:
    1. *Retiro en punto de encuentro (Gratis)*.
    2. *Envío a domicilio / sucursal*.
  - **Selector de Provincias Argentinas**:
    - Desplegable con las 24 provincias (CABA, Buenos Aires, Córdoba, Santa Fe, Mendoza, etc.).
    - Al cambiar de provincia, invocar a la función `calculateShipping(province, postalCode)`:
      - Si `STORE_CONFIG.apiEndpoints.useBackendShipping` es true, ejecutar llamada `fetch` al endpoint de cotización.
      - Si es false, calcular según `STORE_CONFIG.shippingRates`.
    - Campo de Dirección y Código Postal (visibles solo si se elige envío).
  - Desglose final en pantalla: `Subtotal + Envío = Total a pagar`.

### 5. Medios de Pago y Conversión
- **Opción A (Mercado Pago)**:
  - Incluir el script SDK oficial v2 de Mercado Pago (`https://sdk.mercadopago.com/js/v2`).
  - Lógica con hook de backend:
    - Si `useBackendPayments` es true, realizar `POST` a `createPreferenceUrl` con el payload definido y montar el `bricksBuilder` con el `preferenceId` devuelto o redireccionar al `initPoint`.
    - Si es false, abrir un modal con instrucciones claras para configurar la pasarela o redirigir directamente al flujo de WhatsApp.
- **Opción B (Pedido por WhatsApp)**:
  - Botón destacado "Finalizar Pedido vía WhatsApp".
  - Genera una URL `https://wa.me/[numero]?text=...` con el detalle completo codificado con `encodeURIComponent`:
    - Listado de prendas únicas con talle y precio.
    - Método de entrega, provincia y dirección (o punto de retiro).
    - Costo de envío y Total final a abonar.
    - Datos de contacto del cliente.

# RESTRICCIONES Y CALIDAD DE CÓDIGO
- Todo el código debe estar estrictamente dentro de un único archivo HTML (`index.html`).
- Cero código incompleto o `// TODO`. Todas las funciones deben estar implementadas con código Vanilla JS limpio y defensivo.
- Sanitización obligatoria con `textContent` o escape HTML en cualquier dato proveniente de inputs para prevenir vulnerabilidades XSS.

# VALIDACIÓN Y CHECKLIST DE SALIDA
Incluye al pie del archivo un checklist de pruebas para verificar:
1. El bloqueo estricto a 1 unidad por prenda.
2. El funcionamiento del selector de provincias con cálculo local y fallback de la API de envíos.
3. El modal de confirmación antes de vaciar el carrito.
4. La generación del mensaje de WhatsApp con el desglose exacto de productos y flete.
5. Los hooks y contratos JSON de API listos para enchufar el backend.