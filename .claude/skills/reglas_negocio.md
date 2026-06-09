---
name: reglas_negocio
description: Lógica estricta de negocio y directivas de UI/UX para el sistema de turnos y agenda de la peluquería. Leer siempre antes de modificar componentes de reservas o panel de administrador.
---

# Reglas de Negocio - Agenda Peluquería

## 1. Directiva de Estabilidad (Regla de Oro)
- NO refactorizar, modificar ni eliminar lógica existente, modelos de base de datos, o componentes que ya funcionan sin autorización explícita.
- Toda nueva implementación debe integrarse de forma modular y aditiva.

## 2. Experiencia de Usuario (Frontend / Cliente)
- **Cero Input Manual:** Está ESTRICTAMENTE PROHIBIDO usar inputs de texto libres (tipo `dd/mm/yyyy` o tipeo de horas) para la selección de fechas.
- **Calendario Interactivo:** La reserva de turnos debe realizarse a través de un componente de calendario visual (ej. tipo DatePicker moderno).
- **Prevención de Errores:** - El calendario debe bloquear visualmente (`disabled`) los días pasados.
  - El calendario debe bloquear los días no laborables según la base de datos.
  - Al seleccionar un día, el sistema debe renderizar únicamente los "Slots" (bloques de tiempo) efectivamente disponibles.

## 3. Lógica de Disponibilidad (Backend / Motor de Turnos)
La disponibilidad se calcula mediante un sistema de capas (Superposición):
- **Capa 1 (Franja Positiva):** Define el horario base de trabajo diario (Ej: Lunes a Viernes de 09:00 a 17:00).
- **Capa 2 (Franja Negativa / Bloqueos Recurrentes):** Resta disponibilidad dentro de la franja positiva (Ej: Almuerzo de 12:00 a 13:00 todos los días).
- **Capa 3 (Excepciones / Bloqueos Puntuales):** Resta disponibilidad en días específicos (Ej: Feriados, vacaciones, o un turno ya ocupado).
- **Resolución:** Un turno SOLO se puede agendar si el Slot cae dentro de la Franja Positiva Y NO choca con ninguna Franja Negativa ni Excepción.

## 4. Granularidad y Manejo de Tiempo (Crítico)
- **Bloques Base:** Los slots generados deben tener una duración estándar predefinida (ej. intervalos de 30 o 60 minutos) que encajen perfectamente en la Franja Positiva.
- **Zona Horaria (Timezone):** Todo guardado en la base de datos debe ser consistente (preferentemente UTC) y la capa de presentación debe forzar el renderizado en la zona horaria local del negocio para evitar desfasajes.

## 5. Estados del Turno y Concurrencia
- **Estados:** Todo turno debe tener un estado claro (Ej: `Pendiente`, `Confirmado`, `Cancelado`).
- **Bloqueo por Concurrencia:** Si dos usuarios intentan reservar el mismo slot simultáneamente, el backend debe rechazar el segundo intento de forma elegante, devolviendo un mensaje claro al cliente para que elija otro horario.

## 6. Panel de Administración (Dashboard del Peluquero)
- **Visualización Gráfica:** El administrador no debe configurar horarios mediante formularios de texto crudos. Debe existir una vista de "Grilla de Horarios" o "Time-block" visual.
- **Gestión Intuitiva:** El admin debe poder ver su semana completa en forma de tabla/calendario y hacer clic/arrastrar para "Pintar" franjas positivas (verde/abierto) o franjas negativas (rojo/cerrado).
- **Previsualización:** El panel debe mostrarle al administrador una vista previa en vivo de cómo el cliente verá la agenda disponible.