# Cancelación de turno por el cliente — Design Spec

**Fecha:** 2026-06-23
**Objetivo:** Permitir que el cliente cancele su turno sin depender del admin, usando un link único + integración con WhatsApp.

## Flujo

1. Cliente confirma reserva → se genera `cancelToken` único
2. Pantalla de confirmación muestra:
   - Resumen del turno
   - Botón "Enviar por WhatsApp" → abre wa.me con mensaje pre-armado + link cancelación
   - Link de cancelación visible en pantalla
   - Si puso email, se envía el link por email (Resend)
3. Página `/mi-turno/[token]`:
   - Resumen: fecha, hora, servicio(s), modalidad, estado
   - Si faltan >2 horas → botón "Cancelar turno"
   - Si faltan <2 horas → "Ya no se puede cancelar"
   - Si ya cancelado → "Este turno fue cancelado"
4. Al cancelar → estado CANCELADO, slot se libera, admin recibe push notification

## Cambios técnicos

### DB
- Agregar campo `cancelToken String? @unique` al modelo Turno

### Backend
- En `crearTurno`: generar `cancelToken` (randomBytes 16 hex) al crear
- Nueva server action `cancelarTurnoPorCliente(token)`:
  - Busca turno por cancelToken
  - Valida que no esté ya cancelado/completado
  - Valida que falten >2 horas (usando hora Argentina)
  - Cambia estado a CANCELADO
  - Envía push notification al admin: "Turno cancelado por el cliente"
- Si el cliente puso email, enviar link por Resend

### Frontend
- Nueva página `/mi-turno/[token]/page.tsx` (pública, sin auth)
  - Paleta del cliente (navy)
  - Muestra resumen del turno
  - Botón cancelar o mensaje según corresponda
- Modificar pantalla de confirmación en BookingForm:
  - Agregar botón "Enviar por WhatsApp" 
  - Mostrar link de cancelación
  - El mensaje WhatsApp incluye: nombre, fecha, hora, servicio, link cancelación
  - Número del peluquero viene de `marca_telefono`

### Límites
- Cancelación permitida hasta 2 horas antes del turno
- Token no expira (siempre puede ver su turno, pero no cancelar fuera de tiempo)
