# Referencia Visual — Pulido Pre-Producción

Documento de referencia para el ajuste fino pantalla por pantalla. Los mockups vienen de Claude Design y son la meta visual. Este archivo documenta qué mockup corresponde a cada pantalla, qué se agregó más allá de los mockups, y qué del mockup no aplica.

---

## Reglas Globales (aplican a TODAS las pantallas)

### Bottom Nav (mobile)
- **4 items siempre:** Hoy | Turnos | Agenda | Ganancias
- Algunos mockups muestran 3 items o "Config" como 4to — **ignorar**, los 4 correctos son los de arriba
- Los iconos del bottom nav deben ser un poco más grandes que el tamaño actual (pendiente ajustar)

### AppBar Superior (fija en todas las pantallas admin)
- **No está en los mockups** pero se implementó y queda como está
- Contenido: hamburguesa (menú) | logo scissors + nombre del negocio | botón compartir link | botón +Turno
- Esta barra convive con el contenido de cada pantalla debajo

### Espaciado General
- Los mockups muestran más aire entre elementos que la implementación actual
- Títulos de sección (Hoy, Turnos, Ganancias, etc.) deben tener más padding-top respecto al AppBar
- El contenido no debe sentirse "apretado" contra la barra superior

### Login / Forgot Password / Reset Password
- **No necesitan ajuste** — están bien como están, no hay mockup de referencia

---

## Pantallas Admin

### 1. Hoy
- **Mockup:** `comparacion/esperado/admin/01-hoy.jpg`
- **Componente:** `components/mobile/hoy/HoyScreen.tsx`
- **Ruta:** `/admin/hoy`
- **Elementos clave del mockup:** título "Hoy" grande, contador realizados/total, barra de ocupación con %, 3 stat chips (Libres, Ganancia est., Realizado), banner "Próximo turno", lista de turnos con borde izquierdo verde, checkbox circular, badge domicilio amarillo

### 2. Turnos — Lista
- **Mockup:** `comparacion/esperado/admin/02-turnos-lista.jpg`
- **Componente:** `components/mobile/turnos/TurnosScreen.tsx`
- **Ruta:** `/admin/turnos`
- **Elementos clave del mockup:** título "Turnos" + contador + mes, tabs Próximos/Historial, filter chips, agrupación MAÑANA/TARDE, cards con avatar iniciales coloreado, badge estado, hora en mono, precio en verde mono

### 3. Turno — Detalle
- **Mockup:** `comparacion/esperado/admin/03-turno-detalle.jpg`
- **Componente:** `components/mobile/turnos/TurnoDetailView.tsx`
- **Ruta:** (vista interna, no ruta propia)
- **Elementos clave del mockup:** back + "Detalle" + badge estado, avatar grande con iniciales, nombre + teléfono, chips info (servicio, duración, fecha/hora, precio, modalidad, contacto), observaciones en card ámbar, botones Confirmar (verde) / Cancelar (rojo outline)

### 4. Agenda
- **Mockup:** `comparacion/esperado/admin/04-agenda.jpg`
- **Componente:** `components/mobile/agenda/AgendaScreen.tsx`
- **Ruta:** `/admin` (página principal)
- **Elementos clave del mockup:** vista mes con nombre grande "Junio 2026", flechas nav, grilla L-D, día actual resaltado azul, puntos indicadores de turnos (verdes = confirmados), día seleccionado con fondo azul
- **Override:** el AppBar con hamburguesa/logo/compartir/+turno se ve en este mockup y coincide con la implementación

### 5. Ganancias
- **Mockup:** `comparacion/esperado/admin/05-ganancias.jpg`
- **Componente:** `components/mobile/ganancias/GananciasScreen.tsx`
- **Ruta:** `/admin/ganancias`
- **Elementos clave del mockup:** título "Ganancias" + año, tabs Semana/Mes/Año, hero card con total + sparkline + trend badge, 2 stat chips (cortes + ticket promedio), gráfico evolución mensual (barras), gráfico ganancia por servicio (barras coloreadas)

### 6. Menú Hamburguesa (ConfigDrawer)
- **Mockup:** `comparacion/esperado/admin/06-config-menu.jpg`
- **Componente:** `components/mobile/ConfigDrawer.tsx`
- **Ruta:** (drawer, no ruta propia)
- **Elementos clave del mockup:** logo scissors + nombre negocio + "Panel del peluquero", 4 items navegables (Configuración, Servicios, Productos, Horarios)
- **Overrides vs mockup:**
  - El mockup muestra 4 items. La app tiene 5 (incluye "Peluqueros") → **sacar Peluqueros para v1**
  - El mockup NO tiene botón "Cerrar sesión". La app SÍ lo tiene (rojo, abajo) → **mantener, quedó bien**

### 7. Configuración — Perfil
- **Mockup:** `comparacion/esperado/admin/07-config-perfil.jpg`
- **Componente:** `components/mobile/config/PerfilMobile.tsx`
- **Ruta:** (subpantalla de config)
- **Elementos clave del mockup:** back + "Configuración", foto de portada placeholder, filas de datos (nombre negocio, slogan, teléfono, dirección), sección código de descuento con botón verde "Generar código"
- **Override IMPORTANTE:** la sección de código de descuento debe mantener la implementación actual (no el botón verde del mockup). Solo ajustar el estilo visual de las filas de datos para que coincidan con el mockup

### 8. Servicios — Lista
- **Mockup:** `comparacion/esperado/admin/08-config-servicios.jpg`
- **Componente:** `components/mobile/config/ServiciosMobile.tsx`
- **Ruta:** (subpantalla de config)
- **Elementos clave del mockup:** back + scissors + "Servicios", cards con borde izquierdo de color, nombre + duración + precio, ícono editar, botón "Agregar servicio" dashed border

### 9. Servicios — Agregar
- **Mockup:** `comparacion/esperado/admin/09-config-servicios-agregar.jpg`
- **Componente:** (mismo ServiciosMobile.tsx, estado showAdd)
- **Elementos clave del mockup:** card "+ NUEVO SERVICIO" con inputs nombre/precio/duración, botones Cancelar + Guardar (verde)

### 10. Productos — Lista
- **Mockup:** `comparacion/esperado/admin/10-config-productos.jpg`
- **Componente:** `components/mobile/config/ProductosMobile.tsx`
- **Ruta:** (subpantalla de config)
- **Elementos clave del mockup:** back + "Productos", cards con nombre + venta (verde) + neto (verde) + stock grande, ícono editar, botón "Agregar producto" dashed

### 11. Productos — Agregar
- **Mockup:** `comparacion/esperado/admin/11-config-productos-agregar.jpg`
- **Componente:** (mismo ProductosMobile.tsx, estado showAdd)
- **Elementos clave del mockup:** card "+ NUEVO PRODUCTO" con inputs nombre/precio venta/precio compra, ganancia neta calculada auto (verde), stock inicial, botones Cancelar + Guardar (verde)

### 12. Horarios — Lista
- **Mockup:** `comparacion/esperado/admin/12-config-horarios.jpg`
- **Componente:** `components/mobile/config/HorariosMobile.tsx`
- **Ruta:** (subpantalla de config)
- **Elementos clave del mockup:** back + "Horarios", lista L-D con toggles verdes, letras iniciales con colores, franjas horarias inline, chevron para expandir, toggle "Servicio a domicilio" + aviso 45min

### 13. Horarios — Editar Franjas
- **Mockup:** `comparacion/esperado/admin/13-config-horarios-editar.jpg`
- **Componente:** (mismo HorariosMobile.tsx, estado expandido)
- **Elementos clave del mockup:** día expandido con franjas listadas (09:00→12:00, 13:00→20:00), botones editar/eliminar, "+ Agregar franja" + "Copiar a Todos"

### 14. Horarios — Time Picker
- **Mockup:** `comparacion/esperado/admin/14-config-horarios-picker.jpg`
- **Componente:** (mismo HorariosMobile.tsx, modal de edición)
- **Elementos clave del mockup:** modal "EDITAR FRANJA" con drum picker tipo iOS para apertura/cierre, botones Cancelar + Guardar verde

### 15. Horarios — Bloquear Días
- **Mockup:** `comparacion/esperado/admin/15-config-horarios-bloquear.jpg`
- **Componente:** (mismo HorariosMobile.tsx, sección calendario)
- **Elementos clave del mockup:** mini calendario "DÍAS BLOQUEADOS", nav mes, día actual con borde azul, días bloqueados en rojo, instrucción "Tocá un día para bloquearlo/desbloquearlo"

---

## Pantallas Cliente (Formulario de Reserva)

Paleta diferente: navy profundo, gradiente azul-violeta. Sin bottom nav ni AppBar admin.

### 16. Reserva — Paso 1: Servicio
- **Mockup:** `comparacion/esperado/cliente/01-reserva-paso1-servicio.jpg`
- **Componente:** `components/mobile/booking/BookingForm.tsx`
- **Ruta:** `/reservar`
- **Elementos clave:** header con logo + "Reservar turno" + "1/5", título "Elegí el servicio", cards con dot de color + nombre + duración + precio, botón "Continuar" deshabilitado hasta seleccionar

### 17. Reserva — Paso 2: Fecha
- **Mockup:** `comparacion/esperado/cliente/02-reserva-paso2-fecha.jpg`
- **Componente:** (mismo BookingForm.tsx, paso 2)
- **Elementos clave:** resumen paso 1 colapsado con "Cambiar", calendario mensual, día actual con borde, día seleccionado con fondo, toggle "Horario nocturno especial"

### 18. Reserva — Paso 2: Hora
- **Mockup:** `comparacion/esperado/cliente/03-reserva-paso2-hora.jpg`
- **Componente:** (mismo BookingForm.tsx, paso 2 con día seleccionado)
- **Elementos clave:** grilla de slots 4 columnas, slots disponibles con borde, slots ocupados tachados, slot seleccionado con glow violeta

### 19. Reserva — Paso 2: Nocturno
- **Mockup:** `comparacion/esperado/cliente/04-reserva-paso2-nocturno.jpg`
- **Componente:** (mismo BookingForm.tsx, paso 2 con toggle nocturno ON)
- **Elementos clave:** toggle nocturno activado (violeta), slots cambian a rango 20:00-23:00

### 20. Reserva — Paso 3: Modalidad
- **Mockup:** `comparacion/esperado/cliente/05-reserva-paso3-modalidad.jpg`
- **Componente:** (mismo BookingForm.tsx, paso 3)
- **Elementos clave:** resúmenes colapsados pasos 1-2, dos cards grandes "En el local" / "A domicilio" con íconos

### 21. Reserva — Paso 4: Datos
- **Mockup:** `comparacion/esperado/cliente/06-reserva-paso4-datos.jpg`
- **Componente:** (mismo BookingForm.tsx, paso 4)
- **Elementos clave:** resúmenes pasos 1-3, inputs nombre*, teléfono/WhatsApp*, email (opcional), observaciones (opcional)

### 22. Reserva — Paso 5: Confirmar
- **Mockup:** `comparacion/esperado/cliente/07-reserva-paso5-confirmar.jpg`
- **Componente:** (mismo BookingForm.tsx, paso 5)
- **Elementos clave:** resúmenes pasos 1-4, sección "¿Querés agregar productos?", card producto con checkbox, botón "Confirmar reserva" gradiente violeta, link "Omitir y confirmar sin productos"

### 23. Reserva — Confirmación
- **Mockup:** `comparacion/esperado/cliente/08-reserva-confirmacion.jpg`
- **Componente:** (mismo BookingForm.tsx, estado confirmado)
- **Elementos clave:** header verde con check + nombre negocio + "Tu turno está confirmado", filas resumen (servicio, fecha/hora, ubicación, productos), total en mono verde, botón "Reservar otro turno"
