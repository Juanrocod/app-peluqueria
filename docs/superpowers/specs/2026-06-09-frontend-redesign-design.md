# Spec: Rediseño Front-End Integral (Hero UI / Shadcn Style)

**Fecha:** 2026-06-09  
**Área:** `app`, `components`  
**Estado:** Pendiente de revisión del usuario  

---

## 1. Problema

El front-end actual de la aplicación de turnos de peluquería tiene una interfaz inconsistente:
- El flujo de reserva pública usa un tema oscuro (`bg-slate-900`/`bg-zinc-950`) pero con elementos de estilo básicos.
- El panel de administración usa un tema claro simple (`bg-gray-50`) con tablas y componentes básicos que carecen de una jerarquía visual clara, animaciones o un diseño touch-friendly moderno.
- Hay inconsistencias estéticas y estructurales que no aprovechan el potencial de Tailwind CSS v4.

---

## 2. Objetivos y Restricciones

- **Preservar la Lógica**: No modificar ningún endpoint de API, acciones de servidor, base de datos (Prisma), ni lógica de negocio (turnos, bloqueos, disponibilidad, etc.).
- **Estilo Hero UI / Shadcn**: Implementar un diseño refinado inspirado en Shadcn (bordes finos, anillos de enfoque sutiles, tipografía con jerarquía e interlineado correcto, sombras suaves) y Hero UI (elementos interactivos con hover reactivo y bordes redondeados medianos).
- **Paleta de Colores**:
  - **Público (Reserva)**: Modo oscuro fijo para mantener la estética íntima de barbería (`bg-zinc-950` / acentos en `amber-500` y `violet-500`).
  - **Admin Dashboard**: Modo claro refinado por defecto, con soporte completo para modo oscuro adaptativo mediante clases `dark:` de Tailwind CSS v4.
- **Sin Elementos Prohibidos**:
  - Cero bordes laterales decorativos de más de 1px (`border-left`/`border-right` gruesos) en tarjetas o alertas.
  - Cero texto con gradiente (`background-clip: text` decorativo).
  - Cero glassmorphism innecesario.
  - Cero títulos tipo eyebrow en all-caps repetitivos.

---

## 3. Arquitectura del Dashboard y Estructura de Páginas

El dashboard se compone de un Sidebar de navegación izquierdo y un área de contenido principal.

### Sidebar de Navegación (`app/admin/layout.tsx`)
- Un contenedor lateral limpio (`w-64`) con un fondo oscuro sutil (`bg-zinc-900` / `dark:bg-zinc-950`).
- Elementos de navegación (`NavLink`) con hover reactivo (`hover:bg-zinc-800` / `hover:text-white`) y estado activo destacado con fondo `bg-zinc-800 text-white` en oscuro y `bg-zinc-100 text-zinc-900` en claro.
- Perfil de usuario y botón de cerrar sesión alineados al pie.

### Agenda Principal (`components/admin/CalendarioAdmin.tsx` & `app/admin/page.tsx`)
- La grilla del calendario de turnos se rediseña para lucir como un programador semanal moderno.
- Las tarjetas de turnos (`Turno`) serán tarjetas minimalistas con fondos semitransparentes sutiles según su estado:
  - `PENDIENTE`: fondo amarillo tierno (`bg-amber-500/10 border-amber-500/20 text-amber-500`) en modo oscuro, y correspondiente en modo claro.
  - `CONFIRMADO`: fondo azul tierno (`bg-blue-500/10 border-blue-500/20 text-blue-500`).
- Botones de control de semana elegantes y compactos.

---

## 4. Plan de Ejecución (Sub-Agentes)

Dividiremos el rediseño en tareas independientes y concurrentes para no colisionar:

1. **Sub-Agente A (Reserva Pública - Cliente)**:
   - Rediseño de `app/reservar/page.tsx` (sección Hero y layout).
   - Rediseño de `components/booking/FormularioReserva.tsx` (pasos del wizard, inputs, botones de selección de servicios y productos, botones de navegación).
   - Ajuste de `components/booking/CalendarioMes.tsx` para mejorar la selección de fechas.

2. **Sub-Agente B (Admin Layout & Agenda Core)**:
   - Rediseño de `app/admin/layout.tsx` (Sidebar y estructura).
   - Rediseño de `app/admin/page.tsx` y `components/admin/CalendarioAdmin.tsx` (la grilla de turnos y controles).
   - Rediseño de `app/admin/turnos/page.tsx` y `components/admin/AccionesTurnoRow.tsx` (historial y lista de turnos).

3. **Sub-Agente C (Páginas Secundarias del Dashboard)**:
   - Rediseño de `app/admin/servicios/page.tsx` y `components/admin/FormularioServicio.tsx` / `ServicioEditable.tsx`.
   - Rediseño de `app/admin/peluqueros/page.tsx` y `components/admin/FormularioPeluquero.tsx`.
   - Rediseño de `app/admin/horarios/page.tsx` y `components/admin/PanelHorarios.tsx`.
   - Rediseño de `app/admin/catalogo/page.tsx` y formularios de productos/marcas.
   - Rediseño de `app/admin/ganancias/page.tsx` (gráficos y métricas).
   - Rediseño de `app/admin/configuracion/page.tsx` y `app/login/page.tsx`.

---

## 5. Control de Calidad y Verificación

- **Compilación sin errores**: Ejecutar `npx tsc --noEmit` después de cada refactorización.
- **Soporte Responsive**: Verificar a través de layouts flex/grid con anchos flexibles y breakpoints apropiados.
- **Accesibilidad**: Mantener contrastes de texto óptimos (mínimo 4.5:1 para cuerpo de texto).
