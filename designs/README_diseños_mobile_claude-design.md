# Handoff: App Turnos Peluquería

> Paquete de entrega de diseño para el desarrollador.  
> Fecha: junio 2026

---

## Resumen del producto

Aplicación mobile para peluqueros/barberos que permite gestionar turnos, servicios, horarios y ganancias desde el celular. El peluquero es el usuario principal (panel de gestión); los clientes interactúan a través de un formulario de reserva web embebible.

---

## Sobre los archivos de diseño

Los archivos `.dc.html` incluidos en este paquete son **prototipos de alta fidelidad** creados en HTML interactivo. Son referencias de diseño, **no código de producción** para copiar directamente.

La tarea del desarrollador es **recrear estas interfaces en el entorno de la aplicación real** (React Native, Expo, Flutter, React + Tailwind, etc.) usando sus patrones y librerías establecidos, manteniendo fidelidad visual al diseño.

Para ver los prototipos, abrí cualquier `.dc.html` directamente en un navegador (requieren conexión a internet para cargar las fuentes de Google).

---

## Fidelidad

**Alta fidelidad (hifi).** Los prototipos son pixel-accurate: colores exactos, tipografía final, espaciados, estados de hover/active/focus, animaciones y flujos de navegación completos. El desarrollador debe recrear la UI con fidelidad pixel a pixel usando las librerías del proyecto.

---

## Pantallas / Vistas

### 1. Login
**Archivo:** `Login.dc.html` (pantalla 1 dentro del DC)  
**Propósito:** Entrada a la app para el peluquero.

**Layout:**
- Fondo: `#131313`, pantalla completa sin bottom nav
- Contenido centrado verticalmente, padding horizontal `24px`
- Logo centrado: ícono scissors en card `58×58px` radio `18px`, background `#16203A`, borde `#233556`; debajo nombre en Playfair Display 26px
- Subtítulo "Bienvenido de vuelta" en Manrope 13px, color `#6F6F73`
- Margen inferior del logo: `32px`
- Dos inputs (email, contraseña) + link "¿Olvidaste tu contraseña?"
- Botón primario full-width "Ingresar"
- Link "¿No tenés cuenta? Registrate" al pie, centrado

**Componentes:**
- **Inputs:** bg `#1A1A1C`, borde `#38383B` 1.5px, radio `13px`, padding `13px 14px`, font 15px. Focus: borde `#2F6BFF`, ring `rgba(47,107,255,.18)` 3px. Label en mayúsculas, 12px 600, color `#ADADB0`, letter-spacing `0.02em`
- **Botón primario:** bg `#2F6BFF`, hover `#2456D6`, radio `14px`, padding `15px`, full-width, font 700 15px blanco
- **Link de contraseña:** texto `#2F6BFF`, alineado a la derecha, 13px 600, sin borde
- **Link secundario:** "¿No tenés cuenta?" en `#6F6F73` + "Registrate" en `#2F6BFF` 700, centrado

---

### 2. Registro
**Archivo:** `Login.dc.html` (pantalla 2)  
**Propósito:** Crear cuenta nueva para un peluquero.

**Layout:**
- Botón "← Volver" en la parte superior izquierda (color `#ADADB0`, 13px 600)
- Título "Creá tu cuenta" en Playfair Display 22px + subtítulo en 13px `#6F6F73`
- 4 inputs: nombre de peluquería, nombre personal, email, contraseña
- Botón "Crear cuenta" full-width primario
- Link "¿Ya tenés cuenta? Ingresá" al pie

**Campos:** mismos estilos que Login. El input de contraseña tiene ícono eye a la derecha.

---

### 3. Recuperar contraseña
**Archivo:** `Login.dc.html` (pantalla 3)  
**Propósito:** Enviar link de recuperación de contraseña.

**Layout:**
- Botón "← Volver al login"
- Ícono lock en card `48×48px` radio `14px`, bg `#1C1C1E`, borde `#38383B`
- Título "Recuperá tu acceso" Playfair Display 22px
- Descripción 13px `#6F6F73`, line-height 1.55
- 1 input de email
- Botón "Enviar link de recuperación" full-width primario

**Estado de confirmación (pantalla 4):**
- Ícono check verde en card `64×64px`, animación spring: scale 0 → 1.15 → 1, delay 100ms
- Título "¡Link enviado!" Playfair Display 24px
- Texto descriptivo 14px `#ADADB0`
- Botón secundario "Volver al login" (bg `#262628`, borde `#38383B`)

---

### 4. Home / Agenda
**Archivo:** `Home Agenda.dc.html`  
**Propósito:** Pantalla principal del peluquero. Navegación año → mes → día con vista de turnos en línea de tiempo.

**Layout:** Pantalla completa con bottom nav fija. Header con nombre del mes + navegación. Grilla de meses o días según nivel de zoom.

**Navegación calendario:**
- Nivel 1 (Año): grilla de 12 meses
- Nivel 2 (Mes): calendario mensual con días, indicadores de turnos confirmados (punto verde)
- Nivel 3 (Día): línea de tiempo con slots de hora, turnos superpuestos en cards

**Bottom nav** (ver sección dedicada abajo)

---

### 5. Hoy
**Archivo:** `Hoy.dc.html`  
**Propósito:** Vista del día actual con lista de turnos, stats y checkbox para marcar realizados.

**Layout:**
- Header fijo con título "Hoy" (Playfair Display 24px) + fecha en JetBrains Mono + contador `done / total`
- Barra de progreso linear (gradiente verde→azul) con porcentaje de ocupación
- 3 stat chips: Libres / Ganancia estimada / Realizado
- Banner "Próximo turno" con hora y nombre
- Lista de turnos scrolleable

**Tarjeta de turno:**
- bg `#1C1C1E`, borde izquierdo 3.5px verde `#34D399`, radio 14px
- Tap para expandir (acordeón): muestra modalidad, servicio+duración, teléfono, observaciones
- Checkbox circular derecho: vacío → marcado verde. Al marcar: opacidad 0.55, texto tachado, "migra a Ganancias"
- Badge "🏠 domicilio" en amarillo `#E8A33D` para turnos a domicilio

**Stats chips:** bg `#1C1C1E`, borde `#2A2A2C`, radio 11px, números en JetBrains Mono 700

---

### 6. Turnos
**Archivo:** `Turnos.dc.html`  
**Propósito:** Lista completa de turnos con filtros, historial y vista de detalle.

**Layout:**
- Título "Turnos" Playfair Display 26px
- Tabs segmentados "Próximos / Historial" (bg `#1C1C1E`, activo bg `#2F6BFF`)
- Chips de filtro por estado (scrolleable horizontal)
- Lista de tarjetas de turno (tap → vista de detalle)

**Tarjeta de turno:**
- Borde izquierdo 3.5px con color semántico del estado
- Nombre (700 14.5px) + servicio + precio (JetBrains Mono verde `#22D366`)
- Hora (JetBrains Mono 700 15px) + día abreviado a la derecha
- Chevron derecho

**Vista de detalle:**
- Back button + título "Detalle del turno"
- Avatar con iniciales generado dinámicamente (colores según largo del nombre)
- Badge de estado coloreado
- Filas de información: servicio, fecha/hora, modalidad, contacto, precio, observaciones
- Botones de acción según estado:
  - Pendiente → "Confirmar turno" (verde) + "Cancelar turno" (rojo outline)
  - Confirmado → "Marcar como realizado" (azul) + "Cancelar turno"
  - Completado → banner informativo azul

**Colores de estado:**
```
confirmado → #22D366
pendiente  → #E8A33D
cancelado  → #F26157
completado → #2F6BFF
```

---

### 7. Formulario de turno (Vista cliente)
**Archivo:** `Formulario de turno.dc.html`  
**Propósito:** Formulario de reserva que ven los clientes. Paleta diferente (navy profunda).

**Paleta exclusiva de esta vista:**
```
--bg:     #0C1322   /* navy profundo */
--card:   #16213A
--slot:   #1A2742
--border: #2A3A5E
--brand:  linear-gradient(135deg, #3B6EF5, #8B5CF6)
--glow:   0 6px 18px -4px rgba(124,92,246,.55)
```

**Flujo (5 pasos):**
1. **Selección de servicio** — cards con tap, multi-selección, contador de duración y precio
2. **Fecha y horario** — grilla de días del mes + grid 4 columnas de slots horarios. Días pasados: color `#39455E`. Día/horario seleccionado: gradiente brand + glow. Slots ocupados: tachados. Viernes/sábados: toggle nocturno (20:00–23:00)
3. **Modalidad** — dos cards: En el local / A domicilio. Si domicilio: warning en ámbar + input de dirección
4. **Datos personales** — nombre*, teléfono*, email (opcional), observaciones, código de descuento
5. **Resumen + productos** — opción de agregar producto, total estimado, CTA "Confirmar reserva"

**Progress bar** de 5 pasos arriba (gradiente brand).  
**Steps completados** se colapsan como filas resumen con botón "Cambiar".  
**CTA fijo** en el footer.

**Pantalla de confirmación:**
- Card con header verde oscuro `linear-gradient(160deg, #1B7A53, #0E6B47)`
- Ícono check blanco centrado
- Filas de resumen: ✂️ Servicio, 📅 Fecha, 📍 Ubicación, 💈 Productos
- Total en JetBrains Mono verde 20px
- Botón "Reservar otro turno"

---

### 8. Ganancias
**Archivo:** `Ganancias.dc.html`  
**Propósito:** Dashboard de ingresos del peluquero con gráficos.

**Layout:**
- Título "Ganancias" + filtros de período: Semana / Mes / Año
- Hero card (gradiente navy): total del período + sparkline + trend badge
- 2 stat chips: cantidad de cortes + ticket promedio
- Gráfico de barras del período (SVG nativo, gradiente verde→azul)
- Gráfico de barras por servicio (SVG nativo, cada servicio con su color)

**Hero card:**
- bg: `linear-gradient(145deg, #182238, #0F1827)`
- borde: `#253450`
- Total en JetBrains Mono 800 26px blanco
- Sparkline (polyline SVG con área de relleno)

**Filtros de período:** chips radio, activo: borde + bg tintados con color del indicador (verde para semana/año, azul para mes)

---

### 9. Configuración
**Archivo:** `Configuracion.dc.html`  
**Propósito:** Panel de ajustes del peluquero: perfil, servicios, productos y horarios.

**Navegación:** Menú principal con 4 ítems → subpantalla de cada sección (drawer/push).

#### 9a. Menú principal
- Logo + nombre + subtítulo "Panel del peluquero"
- 4 filas navegables: Configuración, Servicios, Productos, Horarios
- Cada fila: ícono coloreado + label + subtítulo + chevron

#### 9b. Configuración / Perfil
- Área de subida de foto (drag-drop placeholder, 1080×720)
- Filas de datos: nombre negocio, slogan, teléfono, dirección
- Generador de código de descuento: botón → genera código alfanumérico → muestra con botón copiar + "Generar otro"

#### 9c. Servicios
- Lista de servicios con borde izquierdo de color propio
- Tap para editar inline: nombre, precio, duración (inputs in-place)
- Botón "Agregar servicio" (dashed border)
- Botón "Eliminar" en rojo en modo edición

#### 9d. Productos
- Lista: nombre + precio de venta + ganancia neta + stock
- Stock ≤ 3 → color ámbar `#E8A33D`
- Edición inline: venta / compra / stock + ganancia neta calculada automáticamente
- Botón agregar con dashed border

#### 9e. Horarios
- Toggle por día (L/M/X/J/V/S/D) — on/off
- Día expandido: franjas de horario editables
- **Drum picker iOS** para editar hora/minuto (scroll de valores, selección con tap)
- Botón "Copiar a todos los días activos"
- Toggle "Servicio a domicilio" — al activar muestra aviso: bloquea 45min antes/después
- **Calendario de días bloqueados**: mini-cal navegable, tap en día para bloquearlo (fondo rojo tinto). Días pasados: no editables

---

## Interacciones y comportamiento

### Animaciones
| Elemento | Animación |
|---|---|
| Cambio de pantalla en Login | `scaleIn`: opacity 0 → 1, scale 0.94 → 1, duración 220ms |
| Check de confirmación | Spring: scale 0 → 1.15 → 1, delay 100ms, duración 350ms |
| Acordeón de turno (Hoy) | height auto, transition 200ms ease |
| Botón checkbox (marcar turno) | `active:scale(0.92)`, transition 100ms |
| Toggle ON/OFF | thumb: left 3px → 21px, transition 150ms ease |
| Drum picker | Click en valor adyacente: scroll snap inmediato |
| Barra de progreso (ocupación) | width transition 400ms ease |

### Hover / Focus states
- **Inputs**: `focus-visible` → border `#2F6BFF`, ring `rgba(47,107,255,.18)` 3px spread
- **Botones primarios**: brightness +10% o color explícito (hover `#2456D6`)
- **Tarjetas de turno**: bg `#232325` en hover
- **Chips**: bg `#303033` en hover
- **Slots de horario**: bg `#233152` en hover (cliente)

### Validaciones de formulario (cliente)
- Paso 1: requiere ≥1 servicio seleccionado
- Paso 2: requiere horario seleccionado
- Paso 3: si domicilio → requiere dirección no vacía
- Paso 4: requiere nombre y teléfono
- CTA deshabilitado (`cursor: not-allowed`, bg `#1A2742`, color `#46557A`) cuando no se cumplen condiciones

### Flujo de estados de turno
```
pendiente → confirmado → completado (migra a Ganancias)
pendiente → cancelado
confirmado → cancelado
```

---

## Gestión de estado

### Autenticación
- `session`: `{ userId, barbershopId, token }` → persiste en AsyncStorage/localStorage
- Redirección: sin sesión → Login; con sesión → Home

### Home / Hoy
- `todayAppointments[]`: cargado al montar, filtrado por fecha actual
- `doneIds[]`: IDs de turnos marcados realizados (persiste localmente, sync con backend al hacer POST)
- `expandedId`: ID del turno expandido (estado local de UI)
- Al marcar como realizado: optimistic update → POST `/appointments/:id/complete` → recalcula ganancias del día

### Turnos
- `activeTab`: `'upcoming' | 'history'`
- `activeFilter`: `'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'`
- `detailId`: ID del turno en vista de detalle (null = lista)
- Cambios de estado: PATCH `/appointments/:id/status`

### Formulario de turno (cliente)
- `step`: 0–4 (flujo lineal)
- `selectedServices[]`: nombres de servicios seleccionados
- `selectedDay`, `selectedTime`: fecha y horario
- `nightMode`: boolean (solo viernes/sábado)
- `place`: `'salon' | 'home'`
- `address`, `name`, `phone`, `email`, `obs`, `discountCode`: strings
- `productAdded`: boolean
- Al confirmar: POST `/appointments` con el objeto completo

### Ganancias
- `period`: `'week' | 'month' | 'year'`
- Datos precargados o fetch a `/earnings?period=...`

### Configuración
- `activeScreen`: `'menu' | 'config' | 'services' | 'products' | 'schedule'`
- `schedules{}`: objeto por día con `{ on: boolean, slots: [{from, to}] }`
- `blockedDates[]`: strings ISO (YYYY-MM-DD)
- `homeCareEnabled`: boolean
- `discountCode`: string o null

---

## Design Tokens

### Colores — Panel del peluquero

```css
/* Fondos */
--bg:          #131313;
--surface-1:   #1C1C1E;   /* cards */
--surface-2:   #262628;   /* inputs, elevado */
--surface-3:   #303033;   /* hover, chips */
--border:      #38383B;
--border-soft: #2A2A2C;

/* Texto */
--text:        #F4F4F2;
--text-muted:  #ADADB0;
--text-faint:  #6F6F73;

/* Acento principal */
--accent:      #2F6BFF;
--accent-dark: #2456D6;
--accent-tint: #16203A;   /* bg de elementos con tinte azul */
--on-accent:   #FFFFFF;

/* Semánticos */
--success:     #34D399;   /* ganancias, confirmado */
--warning:     #E8A33D;   /* pendiente, bloqueos */
--danger:      #F26157;   /* cancelado, eliminar */
--purple:      #B79CFF;   /* coloración, historia */
```

### Colores — Vista del cliente (formulario)

```css
--client-bg:      #0C1322;
--client-card:    #16213A;
--client-slot:    #1A2742;
--client-border:  #2A3A5E;
--client-brand:   linear-gradient(135deg, #3B6EF5, #8B5CF6);
--client-glow:    0 6px 18px -4px rgba(124, 92, 246, 0.55);
```

### Tipografía

```
Display titles:  Playfair Display, serif — 600/700
                 Tamaños: 40px (brand), 28px (título de página), 22–26px (subtítulo de pantalla)

Body / UI:       Manrope, system-ui, sans-serif — 400/500/600/700
                 Tamaños: 20px (section), 16px (sub), 15px (body), 13px (label), 12px (caption), 11px (overline 700 + letter-spacing 0.16em)

Números:         JetBrains Mono, monospace — 500/700
                 Uso: horas, precios, estadísticas, códigos
                 Tamaños: 32px (big money), 22px (medium), 14–15px (inline)
```

### Espaciado y radios

```
Radio botones grandes:  14px
Radio inputs:           12–13px
Radio cards:            16–20px
Radio chips/badges:     999px (pill)
Radio chips cuadrados:  10px

Padding input:          13px 14px
Padding botón grande:   15px (vertical), full-width
Padding card:           18–22px
Gap entre elementos:    8–14px (según densidad)

Bottom nav altura:      56px mínimo (área táctil), safe-area-inset-bottom abajo
```

### Sombras

```
Teléfono mockup:  0 40px 80px -20px rgba(0,0,0,.9)
Turno seleccionado (cliente): var(--client-glow)
Card hero ganancias: sin sombra, usa gradiente de fondo
```

### Íconos

Todos los íconos son SVG inline de **Lucide** (stroke, no fill).  
Tamaños principales: 22px (bottom nav), 18–20px (buttons), 16–17px (inline en tarjetas), 14px (micro).  
Stroke width: 2px. Stroke linecap/linejoin: round.

Íconos usados: `scissors`, `calendar-check`, `calendar-days`, `wallet`, `clock`, `user`, `phone`, `pin`, `tag`, `trash`, `pencil/edit`, `plus`, `x`, `check`, `chevron-right`, `chevron-left`, `arrow-right-circle`, `lock`, `eye`, `menu`, `settings`, `box`, `copy`, `image`, `dollar`, `trending-up`, `moon`, `star`

---

## Bottom Nav

Presente en todas las pantallas de la app (excepto Login/Registro/Recuperar).

```
Estructura:  4 ítems — Hoy | Turnos | Agenda | Ganancias
Altura:      ≥ 56px área táctil + safe-area-inset-bottom (18px adicional)
Fondo:       #161617
Borde top:   1px solid #232325
Ícono:       21px
Label:       10px, activo 700, inactivo 600
Color activo:   #2F6BFF (ícono + label)
Color inactivo: #6F6F73
Dot de notificación: 9px, bg #34D399, borde 2px #131313, posición top-right del ícono
```

Nota: En Configuración la bottom nav tiene 4 ítems incluyendo un ícono de Settings.

---

## Assets

### Fuentes (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800
  &family=Playfair+Display:wght@500;600;700
  &family=JetBrains+Mono:wght@400;500;700
  &display=swap" rel="stylesheet">
```

### Imágenes
No se usan imágenes reales en los prototipos. Las fotos de perfil de clientes son **avatares generados con iniciales**:
- Iniciales: primeras letras del nombre completo (máx. 2)
- Color determinístico según longitud del nombre → paleta de 5 colores: `['#2F6BFF', '#8B5CF6', '#E8A33D', '#22D366', '#F26157']`
- Radio: `nombre.length % 5` → índice del color

Placeholder foto de portada: `1080×720px`

---

## Prioridad de migración sugerida

Orden recomendado para ir pantalla por pantalla:

| Prioridad | Pantalla | Motivo |
|-----------|----------|--------|
| 1 | Design tokens (colores, tipografía, spacing) | Base de todo |
| 2 | Componentes base (botones, inputs, cards, badges, bottom nav) | Se reusan en todas las pantallas |
| 3 | Login / Registro / Recuperar contraseña | Punto de entrada |
| 4 | Hoy | Pantalla de uso diario más crítica |
| 5 | Turnos (lista + detalle) | Segunda pantalla más usada |
| 6 | Home / Agenda | Calendario, más complejo |
| 7 | Configuración (Perfil + Servicios) | Configuración esencial |
| 8 | Ganancias | Dashboard, depende de datos reales |
| 9 | Configuración (Horarios + Productos) | Más complejo, puede ir después |
| 10 | Formulario de turno (cliente) | Vista separada, paleta propia |

---

## Archivos en este paquete

```
design_handoff/
├── README.md                          ← Este archivo
├── Login.dc.html                      ← Login + Registro + Recuperar contraseña
├── Hoy.dc.html                        ← Vista del día
├── Turnos.dc.html                     ← Lista y detalle de turnos
├── Home Agenda.dc.html                ← Agenda tipo calendario
├── Formulario de turno.dc.html        ← Formulario de reserva (vista cliente)
├── Ganancias.dc.html                  ← Dashboard de ganancias
├── Configuracion.dc.html              ← Panel de configuración
├── Componentes base.dc.html           ← Librería de componentes UI
├── Paleta de colores.dc.html          ← Sistema de colores documentado
└── Tipografia.dc.html                 ← Sistema tipográfico documentado
```

---

## Notas para el desarrollador

1. **Sin nav en auth**: Las pantallas de Login/Registro/Recuperar no tienen bottom nav.
2. **Scroll oculto**: El scroll de listas dentro del teléfono no muestra scrollbar (`::-webkit-scrollbar { width: 0 }`).
3. **Drum picker de horarios**: El componente de selección de hora en Configuración > Horarios es una rueda tipo iOS scroll-snap. Si el target es React Native, usar `ScrollView` con `snapToInterval`. En web, puede ser un `<select>` nativo en mobile.
4. **Calendario de días bloqueados**: Solo días futuros son interactivos. La fecha "hoy" tiene borde azul pero también es bloqueble.
5. **Turno a domicilio**: Bloquea automáticamente 45 minutos antes y después en la agenda para el traslado.
6. **Código de descuento**: Generado localmente (no API), formato `PALABRA##`. Si se implementa backend, este endpoint devuelve el código.
7. **Ganancia → Ganancias**: Al marcar un turno como "completado" en Hoy o Turnos, el precio del servicio se suma al total de Ganancias del día/mes/año.
8. **Avatar generado**: El algoritmo de color del avatar es determinístico (`name.length % 5`), así el mismo cliente siempre tiene el mismo color.
