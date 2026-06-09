# Front-End Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar por completo la interfaz del usuario (tanto el flujo de reservas público como el dashboard de administración) utilizando la paleta de colores de zinc, acentos ámbar e índigo/violeta e inspirándose en la estética limpia de Hero UI y Shadcn.

**Architecture:** Dividir el refactor del front-end en tareas independientes y concurrentes que actualicen las clases de Tailwind y estilos visuales, garantizando el aislamiento de la lógica de negocio y base de datos.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS v4, date-fns v4.

---

### Task 1: Rediseño del Flujo de Reserva Pública

**Files:**
- Modify: `app/reservar/page.tsx`
- Modify: `components/booking/FormularioReserva.tsx`
- Modify: `components/booking/CalendarioMes.tsx`

- [ ] **Step 1: Modificar `app/reservar/page.tsx`**

Actualizar el diseño del Hero y la sección de reserva para usar un tema oscuro sofisticado (`bg-zinc-950`), eliminando gradientes estridentes y usando tipografía limpia.
Modificar el contenedor principal de la página:
```tsx
// app/reservar/page.tsx
// Modificar clases de Tailwind en el contenedor del Hero y la sección del Formulario.
```

- [ ] **Step 2: Modificar `components/booking/CalendarioMes.tsx`**

Ajustar el selector de fecha mensual para que use un diseño ultra refinado con bordes `border-zinc-800`, fondos oscuros (`bg-zinc-900`/`bg-zinc-950`) y acentos en ámbar (`text-amber-500` / `hover:bg-zinc-800` / `hover:text-amber-300`).
```tsx
// components/booking/CalendarioMes.tsx
// Ajustar los estilos de los días habilitados, inhabilitados, hoy y seleccionado.
```

- [ ] **Step 3: Modificar `components/booking/FormularioReserva.tsx`**

Rediseñar todo el wizard del formulario (selección de servicio, selección de fecha/hora, modalidad, datos, productos y confirmación) para usar el tema oscuro uniforme `bg-zinc-900` con bordes finos `border-zinc-800`, botones redondeados y acentos ámbar/violeta.
```tsx
// components/booking/FormularioReserva.tsx
// Actualizar StepHeader, inputs, checkboxes y botones.
```

- [ ] **Step 4: Verificar la compilación**

Ejecutar:
```bash
npx tsc --noEmit
```
Expected: 0 errores.

- [ ] **Step 5: Commit**

```bash
git add app/reservar/page.tsx components/booking/FormularioReserva.tsx components/booking/CalendarioMes.tsx
git commit -m "style: redesign public booking page and calendar components to dark mode zinc/amber"
```

---

### Task 2: Rediseño del Layout del Dashboard Admin y Agenda Semanal

**Files:**
- Modify: `app/admin/layout.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `components/admin/CalendarioAdmin.tsx`

- [ ] **Step 1: Modificar `app/admin/layout.tsx`**

Rediseñar el Sidebar del administrador para usar un diseño minimalista oscuro (`bg-zinc-900` / `dark:bg-zinc-950`) con elementos NavLink limpios que usan hover `hover:bg-zinc-800` y estados activos destacados sin bordes laterales gruesos.
```tsx
// app/admin/layout.tsx
// Reemplazar clases del Sidebar y NavLink.
```

- [ ] **Step 2: Modificar `components/admin/CalendarioAdmin.tsx`**

Rediseñar la grilla semanal (`CalendarioAdmin.tsx`) para usar bordes sutiles en gris claro/oscuro (`zinc-200` / `zinc-800`), celdas estilizadas, tipografía compacta y tarjetas de turnos minimalistas con fondo semitransparente sutil según su estado (ej. `bg-amber-500/10 text-amber-500` para PENDIENTE, `bg-blue-500/10 text-blue-500` para CONFIRMADO).
```tsx
// components/admin/CalendarioAdmin.tsx
// Reemplazar la grilla horaria y tarjetas de turnos con estilos premium adaptativos.
```

- [ ] **Step 3: Verificar la compilación**

Ejecutar:
```bash
npx tsc --noEmit
```
Expected: 0 errores.

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx app/admin/page.tsx components/admin/CalendarioAdmin.tsx
git commit -m "style: redesign admin layout sidebar and weekly schedule calendar"
```

---

### Task 3: Rediseño de las Secciones del Panel de Administración y Formularios

**Files:**
- Modify: `app/admin/servicios/page.tsx`
- Modify: `components/admin/FormularioServicio.tsx`
- Modify: `components/admin/ServicioEditable.tsx`
- Modify: `app/admin/peluqueros/page.tsx`
- Modify: `components/admin/FormularioPeluquero.tsx`
- Modify: `app/admin/horarios/page.tsx`
- Modify: `components/admin/PanelHorarios.tsx`
- Modify: `app/admin/catalogo/page.tsx`
- Modify: `components/admin/FormularioProducto.tsx`
- Modify: `components/admin/ProductoEditable.tsx`

- [ ] **Step 1: Rediseñar Formularios de Gestión de Servicios y Peluqueros**

Actualizar inputs, selectores y botones de `FormularioServicio.tsx`, `ServicioEditable.tsx` y `FormularioPeluquero.tsx` para usar bordes finos, anillos de enfoque dinámicos y fondos limpios.

- [ ] **Step 2: Rediseñar Panel de Horarios y Franjas Horarias**

Refactorizar `PanelHorarios.tsx` e `HorarioFranjaEditable.tsx` para lucir como una interfaz de configuración de calendario moderna y limpia.

- [ ] **Step 3: Rediseñar Catálogo de Productos y Formularios de Edición**

Actualizar `FormularioProducto.tsx`, `ProductoEditable.tsx` y las vistas de descuentos y marcas en `app/admin/catalogo/page.tsx`.

- [ ] **Step 4: Verificar la compilación**

Ejecutar:
```bash
npx tsc --noEmit
```
Expected: 0 errores.

- [ ] **Step 5: Commit**

```bash
git add app/admin/servicios/page.tsx components/admin/FormularioServicio.tsx components/admin/ServicioEditable.tsx app/admin/peluqueros/page.tsx components/admin/FormularioPeluquero.tsx app/admin/horarios/page.tsx components/admin/PanelHorarios.tsx app/admin/catalogo/page.tsx components/admin/FormularioProducto.tsx components/admin/ProductoEditable.tsx
git commit -m "style: redesign admin management views, forms, and service/product editors"
```
