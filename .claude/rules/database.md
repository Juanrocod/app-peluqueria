---
paths:
  - "prisma/**/*"
  - "**/*schema*"
---

# Base de Datos y Seguridad

## Ciberseguridad y Blindaje de Datos
- Aplicar **máxima compartimentación** en el diseño de endpoints, APIs, middleware y esquemas.
- Los datos sensibles (información de clientes, turnos, ganancias) deben estar **completamente cegados** ante intentos de extracción externa o scraping.
- Nunca exponer IDs internos, relaciones ni campos sensibles en respuestas de API públicas.
- Validar y sanitizar toda entrada en el servidor. No confiar en validaciones de cliente solamente.
- Usar variables de entorno para credenciales. Nunca hardcodear strings de conexión.

## Manejo de Timezone en Base de Datos
- Todos los campos de fecha/hora se almacenan en **UTC**.
- La conversión a timezone local del negocio ocurre exclusivamente en la capa de presentación.
- Al leer timestamps de la DB, siempre convertir a `Date` con UTC explícito antes de operar.

## Concurrencia y Transacciones
- Las operaciones de reserva de turnos deben ejecutarse dentro de una **transacción atómica**.
- Usar `SELECT FOR UPDATE` o bloqueo optimista para prevenir double-booking en slots.
- En caso de conflicto, la transacción falla limpiamente y retorna un error manejable por el cliente.
