# WORKFLOWS & STANDARD OPERATING PROCEDURES (SOP) — TIENDA DE ROPAS

## 1. Comandos de Desarrollo y Compilación

En Windows PowerShell, utilizar siempre `npm.cmd` en lugar de `npm`:

```powershell
# Instalar dependencias
npm.cmd install

# Servidor de desarrollo local (puerto 3000)
npm.cmd run dev

# Chequeo estático de tipos TypeScript
npm.cmd run lint

# Compilación de producción
npm.cmd run build
```

---

## 2. Flujo de Trabajo DevSecOps para Cambios
1. **Viernes (`coder`):** Implementa el cambio visual o componente.
2. **Fury (`secops`):** Revisa que no haya inputs desprotegidos ni librerías vulnerables.
3. **Tony (`reviewer`):** Valida tipos TypeScript y rendimiento con `npm.cmd run lint` y `npm.cmd run build`.
4. **Rhodey (`visual_qa`):** Inspecciona en vista móvil que el botón de WhatsApp y carrito respondan fluidamente.
5. **Wanda (`documenter`):** Actualiza `LOG.md`, `MEMORY.md` y genera snapshot en Cerebro.
6. **Vision:** Aprobación final y commit en Git.
