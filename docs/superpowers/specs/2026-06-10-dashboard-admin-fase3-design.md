# Spec: Rediseño Dashboard de Administración — Fase 3

**Fecha:** 2026-06-10
**Proyecto:** Agenda Turnos Peluquería
**Alcance:** Frontend-only. Prohibido modificar backend, controladores o lógica de negocio (Regla 6).
**Stack:** Next.js 15 (App Router) + Tailwind CSS + shadcn/ui + Geist font (next/font)

---

## 1. Objetivo

Elevar el panel de administración a nivel SaaS profesional mediante un rediseño visual completo: nuevo sistema de diseño, grilla interactiva de horarios y reorganización de la información en pestañas ergonómicas. Todo el mecanismo de configuración de franjas (Capas 1/2/3 de Regla 3) se preserva intacto — solo cambia la presentación.

---

## 2. Sistema de Diseño

### 2.1 Paleta de Colores

| Rol | Token Tailwind | Hex | Uso |
|---|---|---|---|
| Primary | `violet-600` | `#7C3AED` | Acentos, íconos activos, bordes de foco |
| Primary light | `violet-400` | `#A78BFA` | Textos secundarios, badges, subtítulos |
| CTA | `orange-500` | `#F97316` | Botones de acción principal |
| Background base | — | `#0D0B18` | Fondo de pantalla |
| Surface 1 | — | `#0F0C1A` | Cards y paneles principales |
| Surface 2 | — | `#160D2E` | Headers, bottom nav, items de lista |
| Border | — | `#2D1B69` | Bordes de componentes |
| Text primary | `slate-100` | `#F1F5F9` | Títulos y texto principal |
| Text secondary | `slate-400` | `#94A3B8` | Descripciones y metadatos |
| Text muted | — | `#475569` | Labels, marcadores de tiempo |

**Colores semánticos de grilla (fijos, Regla 6):**

| Estado | Fondo | Borde | Texto |
|---|---|---|---|
| Franja positiva (abierto) | `rgba(16,185,129,0.30)` | `rgba(16,185,129,0.45)` | `#6EE7B7` |
| Franja negativa (bloqueado) | `rgba(239,68,68,0.28)` | `rgba(239,68,68,0.40)` | `#FCA5A5` |
| Día cerrado | `#1A1A26` | `#1E1E2A` | — |

### 2.2 Tipografía

- **Familia única:** Geist (variable font)
- **Carga:** `next/font/google` → sin flash, sin layout shift
- **Escala:**

| Rol | Size | Weight | Uso |
|---|---|---|---|
| Heading | 16–20px | 700 | Títulos de sección |
| Body | 14px | 400 | Contenido general |
| Label | 11–12px | 600 | Etiquetas de campos, KPIs |
| Caption | 9–10px | 400–500 | Metadata, timestamps |
| Mono data | 14px | 600 | Horarios y números (font-variant-numeric: tabular-nums) |

### 2.3 Tokens de Espaciado y Radios

- Base unit: 4px (Tailwind default)
- Cards: `rounded-xl` (12px) / pantallas internas: `rounded-lg` (8px) / chips: `rounded-full`
- Padding de cards: `p-4` (16px)
- Gap entre elementos de lista: `gap-2` (8px)

### 2.4 Sombras y Elevación

```
Nivel 1 (cards): box-shadow: 0 4px 16px rgba(0,0,0,0.4)
Nivel 2 (modales/sheets): box-shadow: 0 12px 40px rgba(0,0,0,0.6)
Nivel 3 (focus/hover): box-shadow: 0 0 0 3px rgba(124,58,237,0.25)
```

---

## 3. Arquitectura de Navegación

### 3.1 Mobile (< 1024px): Bottom Navigation Bar

Barra fija en la parte inferior, altura 56px, fondo `Surface 2`, borde superior `Border`.

```
┌─────────────────────────────────────┐
│  📅 Agenda  │ 📋 Hoy │ 👥 Clientes │ ⚙️ Config  │
└─────────────────────────────────────┘
```

- Íconos: Lucide React (24×24px), trazo 1.5px
- Touch target mínimo: 44×44px por ítem
- Estado activo: ícono color `violet-600`, label `violet-400`
- Estado inactivo: ícono + label `slate-500`
- Transición: `color 150ms ease`

### 3.2 Desktop (≥ 1024px): Sidebar izquierdo

El bottom nav se convierte en sidebar vertical de 220px. Los mismos 4 ítems se muestran con ícono + label horizontal. El contenido ocupa el 100% del ancho restante.

---

## 4. Pantallas

### 4.1 Tab "Agenda" — Grilla Tap-to-Toggle

**Descripción:** Vista semanal completa de disponibilidad. Es la pantalla principal y de uso más frecuente.

**Header:**
- Título "Grilla de Horarios" (Heading, text-primary)
- Badge de semana navegable: `"Jun 8–14"` con flechas `‹` `›` a los lados
- Fondo `Surface 2`, borde inferior `Border`

**Estructura de la grilla:**
```
     L    M    X    J    V    S    D
9h  [🟢] [🟢] [⬛] [🟢] [🟢] [🟢] [🟢]
10h [🟢] [🟢] [⬛] [🟢] [🟢] [🟢] [⬛]
11h [🟢] [🟢] [⬛] [🟢] [🟢] [🟢] [⬛]
12h [🔴] [🔴] [⬛] [🔴] [🔴] [⬛] [⬛]
13h [🟢] [🟢] [⬛] [🟢] [🟢] [⬛] [⬛]
```

- **Columnas:** 7 días (Lunes a Domingo)
- **Filas:** slots de tiempo según granularidad configurada (30 o 60 min)
- **Eje de tiempo:** columna izquierda de 20px, texto Caption muted
- **Cabecera de días:** L M X J V S D, día actual destacado en `violet-400`
- **Celdas:** altura 16px mobile / 20px desktop, `rounded-sm`, `border`, `cursor-pointer`
- **Hover:** `opacity-80`, `cursor-pointer`
- **Transición de celda:** `background 150ms ease, border-color 150ms ease`
- La grilla es **solo visualización** en este tab — la edición ocurre en Config

**Comportamiento de scroll:** La grilla es la única zona con scroll vertical cuando hay más horas que las visibles. El header y el bottom nav permanecen fijos.

---

### 4.2 Tab "Hoy" — Vista Operativa Diaria

**Descripción:** Resumen del día corriente. Lo que el peluquero mira cada mañana.

**Header:** "Hoy, [Día] [Número]" (Heading), subtítulo "X turnos · Y libres" en `violet-400`.

**Fila de KPI chips:**
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│    8     │  │   94%    │  │    2     │
│ Turnos   │  │ Ocupación│  │  Libres  │
└──────────┘  └──────────┘  └──────────┘
```
- Fondo `Surface 2`, borde `Border`, `rounded-xl`
- Valor: 20px / 700 / `violet-400`
- Label: 9px / 500 / muted

**Lista de turnos:**
Cada ítem es una card con:
- Borde izquierdo 2px semántico: verde=confirmado, ámbar=pendiente, rojo=bloqueado/cancelado
- Hora en tabular-nums bold
- Nombre del cliente (Body)
- Badge de estado en esquina derecha

**Empty state:** Si no hay turnos, mensaje "Sin turnos para hoy" + ícono calendario.

---

### 4.3 Tab "Config" — Configuración de Horarios (Accordion 3 capas)

**Descripción:** Gestión de las 3 capas de disponibilidad (Regla 3). Mecanismo actual preservado, rediseñado como accordion.

**Header:** "Configuración" / subtítulo "N capas activas"

#### Capa 1 — Horario Base (dot verde)

**Expandida por defecto.** Una fila por día de la semana (L a D):

```
● Horario Base        ▲
──────────────────────
Lun  09:00 – 18:00   [toggle ON ]
Mar  09:00 – 18:00   [toggle ON ]
Mié  Cerrado          [toggle OFF]
Jue  09:00 – 18:00   [toggle ON ]
Vie  09:00 – 15:00   [toggle ON ]
Sáb  09:00 – 13:00   [toggle ON ]
Dom  Cerrado          [toggle OFF]
```

- Toggle: componente shadcn/ui `<Switch>` con colores del sistema
- Al activar un día cerrado → los campos de hora aparecen con animación `height` 200ms
- Rangos de hora: dos campos tipo `<Select>` o `<TimePicker>` con opciones en intervalos de 30min. **Sin input de texto libre** (Regla 2)

#### Capa 2 — Bloques Recurrentes (dot rojo)

Lista de bloques negativos que se repiten. Cada bloque:

```
● Bloques Recurrentes   ▼ (colapsado por defecto)
──────────────────────
[🔴 12:00–13:00  Almuerzo        ✕]
[🔴 17:30–18:00  Cierre anticipado ✕]
[+ Agregar bloque recurrente        ]
```

- Botón `✕` elimina el bloque con confirm dialog
- Botón `+ Agregar` abre un inline form: selección de hora inicio, hora fin, etiqueta (campo de texto libre solo para etiqueta, no para horarios)

#### Capa 3 — Fechas Bloqueadas (dot ámbar)

Excepciones puntuales. Selector de fecha visual (DatePicker sin input manual, Regla 2):

```
● Fechas Bloqueadas    ▼ (colapsado por defecto)
──────────────────────
[25 dic] [1 ene] [+]
```

- Chips de fechas bloqueadas, eliminables con ✕
- Botón `+` abre DatePicker visual (shadcn/ui Calendar)

#### Botón "Ver Preview"

Al pie del accordion, botón secundario de ancho completo:

```
[👁 Ver cómo me ven los clientes]
```

Abre un **modal slide-up** (sheet desde abajo) que renderiza la vista del DatePicker del cliente con la disponibilidad real calculada desde el estado actual de configuración. **Solo lectura.** Cumple Regla 6 — previsualización en vivo.

---

## 5. Comportamiento Responsive

| Breakpoint | Navegación | Grilla | Config |
|---|---|---|---|
| < 640px | Bottom nav | 7 col × filas, scroll vertical | Accordion full-width |
| 640–1023px | Bottom nav | Celdas más grandes (20px alto) | Accordion con 2 col en Capa 1 |
| ≥ 1024px | Sidebar 220px | Expand full + celdas 24px alto | Split: accordion izq + preview grilla der |

---

## 6. Accesibilidad (Regla Impeccable)

- Todas las celdas de grilla: `role="button"`, `aria-label="[Día] [Hora] — [Estado]"`, `aria-pressed`
- Toggles de días: `aria-checked`, `aria-label="Activar [Día]"`
- Bottom nav: `role="navigation"`, `aria-current="page"` en ítem activo
- Focus ring: `outline: 2px solid #7C3AED`, `outline-offset: 2px` en todos los interactivos
- Tab order: izquierda → derecha, arriba → abajo en la grilla
- `prefers-reduced-motion`: transiciones desactivadas si el usuario lo prefiere
- Contraste verificado: `#A78BFA` sobre `#0D0B18` → ratio 5.2:1 ✓ (WCAG AA)

---

## 7. Componentes Nuevos a Crear

| Componente | Path sugerido | Descripción |
|---|---|---|
| `AdminShell` | `components/admin/AdminShell.tsx` | Layout wrapper con bottom nav / sidebar |
| `BottomNav` | `components/admin/BottomNav.tsx` | Navegación inferior mobile |
| `ScheduleGrid` | `components/admin/ScheduleGrid.tsx` | Grilla 7×N tap-to-toggle |
| `TodayView` | `components/admin/TodayView.tsx` | Vista operativa del día |
| `ScheduleConfig` | `components/admin/ScheduleConfig.tsx` | Accordion 3 capas |
| `LayerBaseHours` | `components/admin/LayerBaseHours.tsx` | Capa 1 — horario base |
| `LayerRecurring` | `components/admin/LayerRecurring.tsx` | Capa 2 — bloques recurrentes |
| `LayerExceptions` | `components/admin/LayerExceptions.tsx` | Capa 3 — fechas bloqueadas |
| `ClientPreviewModal` | `components/admin/ClientPreviewModal.tsx` | Modal de previsualización |

Todos los componentes son **puramente visuales** — consumen datos vía props desde los mismos hooks/server actions que ya existen. No se modifica ningún endpoint ni lógica de backend.

---

## 8. Restricciones Críticas (Regla 6)

1. **Frontend-only.** Cero cambios en `prisma/schema.prisma`, API routes, server actions o lógica de cálculo de disponibilidad.
2. **Mecanismo de entrada preservado.** Los campos de Día de semana, Franja Positiva, Franja Negativa y Bloqueo puntual siguen existiendo — solo cambia cómo se presentan visualmente.
3. **Sin inputs de texto libre para fechas/horas** (Regla 2). Usar siempre Select, Switch o DatePicker visual.
4. **Colores semánticos no negociables:** verde = disponible, rojo = bloqueado. No usar estos colores para otros fines en el dashboard.
