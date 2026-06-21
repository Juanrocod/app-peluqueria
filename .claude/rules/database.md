---
paths:
  - "prisma/**/*"
  - "**/*schema*"
---

# Base de Datos y Seguridad

## Neon DB (PostgreSQL Serverless)
- Conexión via connection pooler. El pooler no soporta `prisma migrate deploy` — las migraciones se corren con `prisma migrate dev` en local o desde el dashboard de Neon.
- `prisma generate` debe estar en `postinstall` o `build` para que Vercel genere el cliente.

## Zona Horaria en Base de Datos
- Los campos `DateTime` de Prisma se almacenan como UTC en Neon.
- El servidor fuerza `TZ=America/Argentina/Buenos_Aires` (ver `next.config.mjs`), por lo que al leer un `Date` de Prisma y usar `getHours()`, se obtiene hora argentina.
- **NO** convertir manualmente a UTC al comparar slots — el sistema ya es consistente con el TZ forzado del servidor.

## Seguridad de Datos
- Aplicar máxima compartimentación en endpoints y APIs.
- Nunca exponer IDs internos ni campos sensibles en respuestas de API públicas.
- Validar y sanitizar toda entrada en el servidor. No confiar en validaciones de cliente.
- Usar variables de entorno para credenciales. Nunca hardcodear strings de conexión.

## Concurrencia y Transacciones
- Las operaciones de reserva de turnos usan check-then-create con `duracionSnapshot` dentro de la server action.
- En caso de conflicto, retornar error manejable por el cliente con mensaje claro para elegir otro horario.

## Regla: No Migrar Sin Aprobación
Cualquier cambio al schema de Prisma debe ser propuesto y aprobado por el usuario antes de ejecutar `prisma migrate`.
