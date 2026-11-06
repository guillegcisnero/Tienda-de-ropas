<div align="center">

# ESVEN
### *Curated Circular Fashion Web Store — A Brand by Icariel*

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Performance](https://img.shields.io/badge/First_Paint-<0.8s-00C781?style=flat-square&logo=speedtest&logoColor=white)](#performance-targets)
[![Architecture](https://img.shields.io/badge/Engineering-Agent_Orchestrated-blueviolet?style=flat-square)](#engineering-paradigm-agentic-orchestration)

<p align="center">
  <a href="#english">English</a> • <a href="#español">Español</a>
</p>

---

</div>

<a name="english"></a>
## English Documentation

### 1. About the Brand: ESVEN & The Icariel Philosophy

**ESVEN** is a high-speed, fully responsive digital circular fashion storefront, engineered with a mobile-first philosophy while delivering a rich, desktop-class web experience. Inspired by the Greek titan **Stilbon** (*the sparkling herald of the wandering stars, embodied by swiftness and celestial dynamism*), ESVEN redefines the concept of the vintage thrift shop (*"feria americana"*) for the modern web era.

Operating under the umbrella of **Icariel**—the parent organization committed to modern, purpose-driven ventures—ESVEN stands at the intersection of conscious consumption and modern digital convenience:

* **Timeless Aesthetic Over Fast Fashion:** Rather than chasing fleeting trends, ESVEN curates enduring, character-rich clothing designed to last across generations.
* **Curated Circular Economy:** Breathing a second life into one-of-a-kind (1/1) vintage and pre-loved garments, dramatically reducing textile waste and resource depletion.
* **Precision Sizing & Conscious Fit:** Every single piece is cataloged with exact measurements in centimeters, ensuring an accurate fit on unique 1/1 pieces.
* **Frictionless Omnichannel Commerce:** Ultra-fast catalog browsing (<0.8s load), instant filtering, persistent local cart, and a hybrid checkout flow: seamless WhatsApp order preformatting (zero intermediary fees) alongside integrated payment options across desktop and mobile.

---

### 2. Key Architecture & Features

* **Sub-Second Performance (<0.8s FCP):** Architected with React 19, code splitting via dynamic imports (`React.lazy`), and pre-computed styles with Tailwind CSS v4.
* **Full Web & Mobile-First Ergonomics:** Flawless cross-device experience—from expansive desktop monitors to thumb-driven mobile viewports (360px–430px) with accessible touch targets (≥48px).
* **Deterministic Single-Stock Cart:** Automatically prevents race conditions or over-ordering on unique 1/1 pieces using resilient `localStorage` synchronization.
* **Dual Checkout Engine:**
  * Direct-to-WhatsApp formatted dispatch (`wa.me`) with complete order breakdown and shipping estimations.
  * Extensible gateway checkout integration for instant card and digital wallet settlements.

---

### 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Core Framework** | React 19 + TypeScript | Strict type safety, modern concurrent rendering, and zero runtime overhead. |
| **Styling & Design System** | Tailwind CSS v4 + Lucide React | High-performance CSS engine, atomic utility classes, accessible icon set. |
| **Build Engine** | Vite 8 | Lightning-fast HMR and optimized tree-shaken production bundles. |
| **State & Storage** | React Custom Hooks + LocalStorage | Lightweight, persistent state management without bloated external dependencies. |

---

### 4. Getting Started

#### Prerequisites
* Node.js 18+ or 20+
* npm or pnpm

#### Installation & Development
```bash
# Clone the repository
git clone https://github.com/your-username/esven-store.git
cd esven-store

# Install dependencies
npm install

# Start local development server
npm run dev
```

#### Build for Production
```bash
npm run build
npm run preview
```

---

### 5. Engineering Paradigm: Agentic Orchestration & Human Craftsmanship

> *"The future of software engineering is not about typing syntax by hand, but about systems architecture, taste, problem formulation, and directing autonomous agents with surgical precision."*
> — *Guillermo Rauch, Founder & CEO of Vercel*

This project was built from the ground up utilizing an **advanced autonomous multi-agent engineering workflow**. 

Rather than treating AI as a mere code generator or auto-complete snippet tool, the founder (**Guillermo**) acted as the **Systems Director and Lead Architect**, designing a complete governance framework (`governance/`) with specialized subagent personas:

* **Vision (Tech Lead):** Orchestration, architectural decisions, and performance enforcement (<0.8s SLA).
* **Viernes (Coder):** Component authoring, strict typing, and utility implementations.
* **Tony (Reviewer):** Clean code audits, hook lifecycle validation, and bundle optimization.
* **Rhodey (Visual QA):** Mobile touch targets, responsive constraints, and accessibility audits.
* **Fury (SecOps):** Input sanitization, DLP, and deep-link protocol validation.
* **Wanda (Documentation):** Architecture memory maintenance and decision logging.

Through context curation, rigorous constraints, and iterative human direction, the founder demonstrates that high-tier software craftsmanship today lies in **the mastery of AI orchestration, technical judgment, and domain governance**.

---

<div align="center">

---

<a name="español"></a>
## Documentación en Español

### 1. Sobre la Marca: ESVEN y la Filosofía de Icariel

**ESVEN** es una tienda web de moda circular digital completa y responsiva, diseñada bajo una filosofía *mobile-first* pero optimizada integralmente tanto para computadoras de escritorio como para dispositivos móviles, con foco en velocidad extrema y experiencia de usuario. Inspirada en el titán griego **Estilbón / Stilbon** (*el heraldo brillante de las estrellas errantes, caracterizado por su agilidad, destello y dinamismo*), ESVEN reinterpreta el concepto tradicional de la feria americana elevándolo a un estándar de curaduría web de vanguardia.

Formando parte del ecosistema de **Icariel**—su matriz orientada a proyectos con propósito y sostenibilidad—, ESVEN se apoya en los siguientes pilares:

* **Atemporalidad frente a la Moda Descartable:** Más allá de las modas efímeras del *fast fashion*, seleccionamos indumentaria atemporal con personalidad y calidad duradera.
* **Economía Circular y Reciclaje de Prendas:** Dar una segunda vida a prendas únicas (1/1) y vintage seleccionadas, disminuyendo el impacto ecológico y los desechos textiles.
* **Curaduría de Feria Americana Digital:** Una experiencia cuidada y accesible que dignifica la ropa recuperada, con fichas técnicas claras y medidas exactas en centímetros para garantizar un calce informado en piezas únicas 1/1.
* **Comercio Omnicanal Ágil y sin Fricción:** Catálogo ultra veloz (<0.8s), filtros instantáneos, carrito persistente en el dispositivo y un flujo de compra dual: envío de pedido estructurado directo a WhatsApp (cero comisiones intermediarias) junto con integración a pasarelas de pago, funcionando de forma fluida tanto en PC como en smartphone.

---

### 2. Características y Arquitectura Técnica

* **Rendimiento Sub-Segundo (<0.8s FCP):** Construida sobre React 19, división de código por imports dinámicos (`React.lazy`) y motor de diseño compilado con Tailwind CSS v4.
* **Diseño Web Responsivo y Ergonomía Mobile-First:** Experiencia multidispositivo sin fisuras—desde monitores de escritorio hasta navegación móvil con una sola mano (viewports de 360px a 430px) con áreas táctiles accesibles (≥48px).
* **Carrito Determinista de Prenda Única:** Mecanismo en `localStorage` que impide duplicar o sobrevender piezas exclusivas 1/1.
* **Checkout Híbrido:**
  * Despacho directo a WhatsApp (`wa.me`) con mensaje preformateado con detalle de prendas, talles y cotización de envío.
  * Pasarela para cobro digital inmediato y reservas automáticas.

---

### 3. Pila Tecnológica

| Capa | Tecnología | Propósito |
|---|---|---|
| **Framework Base** | React 19 + TypeScript | Tipado estricto, concurrencia moderna y máxima confiabilidad en tiempo de ejecución. |
| **Estilos & UI** | Tailwind CSS v4 + Lucide React | Motor atómico ultraligero y conjunto de iconos accesibles y optimizados. |
| **Empaquetador** | Vite 8 | Servidor de desarrollo instantáneo y empaquetado optimizado con *tree-shaking*. |
| **Estado y Almacenamiento** | Hooks Personalizados + LocalStorage | Persistencia ligera del carrito sin sobrecarga de dependencias externas. |

---

### 4. Puesta en Marcha

#### Requisitos Previos
* Node.js 18+ o 20+
* npm o pnpm

#### Instalación y Entorno Local
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/esven-store.git
cd esven-store

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

#### Compilación para Producción
```bash
npm run build
npm run preview
```

---

### 5. Paradigma de Ingeniería: Orquestación con Agentes y Criterio Humano

> *"El futuro de la ingeniería de software no consiste en teclear sintaxis a mano, sino en la arquitectura de sistemas, el criterio estético, la formulación del problema y la dirección quirúrgica de agentes autónomos."*
> — *Guillermo Rauch, Fundador & CEO de Vercel*

Este proyecto fue desarrollado íntegramente mediante un **flujo avanzado de ingeniería asistida por agentes autónomos de IA**.

En lugar de emplear la IA como un simple autocompletador o generador superficial de código, el fundador (**Guillermo**) asumió el rol de **Director de Sistemas y Arquitecto Principal**, definiendo una estructura formal de gobernanza (`governance/`) compuesta por subagentes especializados:

* **Vision (Tech Lead):** Orquestación general, decisiones de arquitectura y cumplimiento de latencia (<0.8s).
* **Viernes (Coder):** Desarrollo de componentes React 19, tipado estricto e integraciones.
* **Tony (Reviewer):** Auditoría de código limpio, ciclo de vida de hooks y optimización de bundle.
* **Rhodey (Visual QA):** Control de experiencia móvil, ergonomía de pulgar y accesibilidad.
* **Fury (SecOps):** Sanitización de inputs, prevención de fugas de datos y validación de protocolos.
* **Wanda (Documentación):** Registro de decisiones técnicas y memoria de arquitectura.

A través de la curaduría de contexto, límites de seguridad claros y supervisión técnica iterativa, el proyecto pone de manifiesto que el verdadero valor en la era de la inteligencia artificial radica en **el criterio técnico, la organización de agentes y la visión estratégica del desarrollador**.

---

### 6. Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.

Desarrollado con criterio, diseño y tecnología para **ESVEN** (por **Icariel**).

</div>
