# Spec: Calendario Visual en Formulario de Reserva

**Fecha:** 2026-06-08  
**Área:** `components/booking`  
**Estado:** Aprobado por el usuario

---

## Problema

El Paso 2 del formulario de reserva (`FormularioReserva.tsx`, línea 184) usa un `<input type="date">` nativo del browser. Esto viola la regla 2 de `reglas_negocio.md` ("Cero Input Manual") y produce una UX inconsistente entre plataformas, no es touch-friendly y no puede bloquear visualmente fechas inválidas.

---

## Solución

Reemplazar el `<input type="date">` por un componente de grilla mensual custom (`CalendarioMes`), y convertir todo el formulario a un tema dark homogéneo.

---

## Archivos a modificar

| Archivo | Operación |
|---|---|
| `components/booking/CalendarioMes.tsx` | Crear — nuevo componente |
| `components/booking/FormularioReserva.tsx` | Modificar — reemplazar input y aplicar tema dark |

Ningún otro archivo se toca. La lógica de slots, la acción `crearTurno`, las APIs, el schema de Prisma y los pasos 1/3/4/5 permanecen intactos.

---

## Componente `CalendarioMes`

### Props

```tsx
type Props = {
  value: string            // fecha seleccionada "yyyy-MM-dd" | ""
  onChange: (fecha: string) => void
}
```

### Estado interno

```tsx
const [mesActual, setMesActual] = useState<Date>(startOfMonth(new Date()))
```

### Dependencias

Solo `date-fns` (ya instalado). Funciones usadas:
- `startOfMonth`, `endOfMonth`, `eachDayOfMonth`
- `startOfWeek` (weekStartsOn: 1 — lunes)
- `getDay`, `isBefore`, `isToday`, `isSameDay`
- `format` (para emitir "yyyy-MM-dd" y mostrar "MMMM yyyy" en español)
- `addMonths`, `subMonths`

### Lógica de grilla

1. Obtener todos los días del mes con `eachDayOfMonth(startOfMonth(mesActual))`.
2. Calcular el offset de la primera celda: `(getDay(primerDia) + 6) % 7` para alinear a lunes.
3. Renderizar `offset` celdas vacías antes del día 1.
4. Por cada día evaluar:
   - `isBefore(day, startOfToday())` → `disabled` (color `#1e3a5f`, cursor not-allowed)
   - `isToday(day)` → borde outline cyan `#0ea5e9`
   - `isSameDay(day, parseISO(value))` → gradiente azul-violeta (`#3b82f6` → `#8b5cf6`)
   - Ninguna de las anteriores → disponible (color `#94a3b8`, hover `#7dd3fc`)

### Navegación de meses

- Botón `←`: deshabilitado si `mesActual <= startOfMonth(new Date())` (no se puede ir al pasado).
- Botón `›`: siempre habilitado (no hay límite futuro).

### Al seleccionar un día

Llama `onChange(format(day, "yyyy-MM-dd"))` solo si el día no está deshabilitado.

---

## Modificaciones en `FormularioReserva`

### Tema dark — formulario completo

El wrapper principal cambia de `bg-white` a `bg-slate-900`:

```tsx
// antes
<div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-6">

// después
<div className="bg-slate-900 rounded-2xl shadow p-6 flex flex-col gap-6">
```

Todos los textos, divisores, inputs, botones y `StepHeader` se adaptan a la paleta dark:
- Textos principales: `text-slate-100` / `text-slate-200`
- Textos secundarios: `text-slate-500`
- Divisores: `border-slate-800`
- Inputs (`<input>`, `<textarea>`): `bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500`
- Botones de servicios/modalidad: `bg-slate-800 border-slate-700 hover:border-indigo-500`
- Botón seleccionado: `border-indigo-500 bg-indigo-950`
- CTA principal: gradiente `from-blue-500 to-violet-600`

### `StepHeader` en dark

```tsx
// badge activo
"bg-indigo-500 text-white"   // en vez de bg-blue-600

// badge completado
"bg-green-500 text-white"    // sin cambio

// badge idle
"bg-slate-800 text-slate-600"   // en vez de bg-gray-200

// título activo
"text-slate-100"   // en vez de text-gray-900

// título idle
"text-slate-600"   // en vez de text-gray-500

// botón "Cambiar"
"text-blue-400"    // en vez de text-blue-500
```

### Paso 2 — reemplazo del input

```tsx
// antes (línea 184-189)
<input
  type="date"
  value={fecha}
  min={new Date().toISOString().split("T")[0]}
  onChange={(e) => { setFecha(e.target.value); ... }}
  className="border rounded-lg px-3 py-2 ..."
/>

// después
<CalendarioMes
  value={fecha}
  onChange={(f) => { setFecha(f); setEspecial(false); setHora(""); cargarSlots(f, false, modalidad); }}
/>
```

Los slots, el toggle de horario nocturno especial y la lógica de `cargarSlots` no se modifican.

---

## Paleta dark — tokens de referencia

| Token | Valor |
|---|---|
| Fondo card | `#0f172a` (slate-900) |
| Fondo elementos | `#1e293b` (slate-800) |
| Borde | `#334155` (slate-700) |
| Texto principal | `#e2e8f0` (slate-200) |
| Texto secundario | `#94a3b8` (slate-400) |
| Texto deshabilitado | `#1e3a5f` |
| Acento hoy | `#0ea5e9` (sky-500) |
| Acento seleccionado | gradiente `#3b82f6` → `#8b5cf6` |
| Sombra gradiente | `rgba(99,102,241,0.5)` |

---

## Comportamiento del calendario — edge cases

- **Mes actual con días pasados**: los días pasados (antes de hoy) se muestran en color `#1e3a5f` y no responden al clic.
- **Primer mes navegable**: si el usuario llega al mes actual navegando atrás, el botón `←` se deshabilita.
- **Sin fecha seleccionada**: `value=""`, ninguna celda aparece resaltada.
- **Reset al cambiar servicio**: `FormularioReserva` ya hace `setFecha("")` al volver al paso 1 — el calendario mostrará el mes actual sin selección.

---

## Lo que NO cambia

- Lógica de `cargarSlots` y su firma
- API `/api/disponibilidad`
- Toggle de horario especial nocturno (viernes/sábado)
- Grid de slots (`grid-cols-4`)
- Pasos 3 (modalidad), 4 (datos), 5 (productos) — solo reciben los ajustes de color dark
- Acción `crearTurno` y toda la lógica de confirmación
- Schema de Prisma, modelos, seeds
