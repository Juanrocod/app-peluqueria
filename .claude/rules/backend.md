---
paths:
  - "src/lib/**/*"
  - "src/actions/**/*"
  - "src/app/api/**/*"
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

### Zona Horaria (Crítico)
- **Almacenamiento:** siempre en **UTC**.
- **Presentación:** la capa de UI fuerza el renderizado en la timezone local del negocio.
- Nunca persistir timestamps naive.

## Estados del Turno

| Estado | Descripción |
|--------|-------------|
| `Pendiente` | Solicitado pero no confirmado |
| `Confirmado` | Aceptado por el administrador |
| `Cancelado` | Cancelado por cliente o admin |

## Manejo de Concurrencia
- El backend **rechaza** el segundo intento de reserva sobre un slot ya tomado.
- Devolver mensaje claro al cliente para que elija otro horario sin perder su selección de fecha.
- Implementar bloqueo optimista o transacción con `SELECT FOR UPDATE` en la operación de reserva.

## Esquema Prisma — Modelos Requeridos
El esquema debe soportar los tres modelos de disponibilidad:
- **FranjaPositiva:** día de semana, hora inicio, hora fin.
- **FranjaNegativa:** recurrente (día/hora) o puntual (fecha específica).
- **Turno/Slot:** fecha, hora, duración, estado, FK a cliente y peluquero.

Cualquier cambio al esquema debe ser propuesto y aprobado antes de ejecutar `prisma migrate`.
