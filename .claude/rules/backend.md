---
paths:
  - "lib/**/*"
  - "actions/**/*"
  - "app/api/**/*"
---

# Backend — Motor de Disponibilidad y Lógica de Turnos

## Motor de Disponibilidad: Sistema de 3 Capas (Superposición)

| Capa | Nombre | Descripción | Ejemplo |
|------|--------|-------------|---------|
| 1 | **Franja Positiva** | Horario base de trabajo diario | Lunes a Viernes 09:00–17:00 |
| 2 | **Franja Negativa / Bloqueo Recurrente** | Resta disponibilidad dentro de la Franja Positiva | Almuerzo 12:00–13:00 todos los días |
| 3 | **Excepción / Bloqueo Puntual** | Resta disponibilidad en días específicos | Feriados, vacaciones, turno ya ocupado |

**Regla de Resolución:** Un turno SOLO puede agendarse si el Slot cae dentro de la Franja Positiva **Y** no choca con ninguna Franja Negativa ni Excepción.

## Granularidad y Manejo de Tiempo

### Bloques Base (Slots)
- Duración estándar predefinida (intervalos de 30 o 60 minutos).
- Los slots deben encajar perfectamente dentro de la Franja Positiva sin overflow.

### Zona Horaria (CRÍTICO — leer antes de tocar)
- **Servidor:** fuerza `TZ=America/Argentina/Buenos_Aires` en `next.config.mjs`. Esto hace que `getHours()`/`getMinutes()` devuelvan hora argentina tanto en local como en Vercel.
- **Base de datos:** Neon almacena timestamps en UTC. Prisma los devuelve como `Date` JS.
- **Comparación de slots:** `getSlotDisponibles()` en `lib/disponibilidad.ts` genera slots usando hora local del servidor (que es argentina por el TZ forzado). `crearTurno` extrae hora/minuto del `Date` recibido usando el mismo TZ del servidor.
- **NO cambiar a UTC puro** — se intentó y causó mismatches entre slots generados y hora extraída. La solución actual (TZ forzado) es consistente.

## Estados del Turno

| Estado | Descripción |
|--------|-------------|
| `PENDIENTE` | Solicitado pero no confirmado |
| `CONFIRMADO` | Aceptado por el administrador |
| `CANCELADO` | Cancelado por cliente o admin |
| `COMPLETADO` | Realizado, migra a ganancias |

## Seguridad
- Todas las server actions admin están protegidas con `requireAdmin()` de `lib/auth-guard.ts`.
- `crearTurno` usa check-then-create con `duracionSnapshot` para prevenir race conditions.
- Las acciones de estado usan `startTransition(async () => { await action() })` — el `await` es obligatorio para que React detecte la transición.

## Convenciones
- `diaSemana`: `0`=Domingo, `1`=Lunes … `6`=Sábado (convención JS `getDay()`)
- `ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]` — renderizar siempre L→D
- `revalidatePath` después de mutaciones: incluir todas las rutas afectadas (`/admin`, `/admin/turnos`, `/admin/hoy`, `/admin/ganancias`).
