---
paths:
  - "src/components/**/*"
  - "src/app/**/*"
  - "**/*.tsx"
  - "**/*.css"
---

# Frontend — Reglas de UI/UX y Panel de Administración

## Perfil del Usuario
Dueño o administrador de una peluquería. Usa el panel a diario desde el celular (entre clientes, de pie) y desde desktop cuando planifica la semana. No es técnico: quiere información rápida, acciones directas, cero fricción. Éxito = ver el estado del día, confirmar un turno y navegar a cualquier sección en menos de 3 toques.

## Identidad Visual
- **Oscuro por convicción:** dark mode es la identidad, no un tema alternativo. No mezclar fondos claros sin propósito.
- **Paleta:** Zinc/slate oscuro como base. Violeta como acento primario. No decorativo: comunica software serio, no planilla.
- **Tipografía premium y alta legibilidad.** Jerarquía de tamaños marcada (≥1.25 ratio entre niveles).
- **Anti-references:** Excel legacy, templates ERP/2000s, tablas densas con borders grises, tipografía de 11px.

## Principios de Diseño
1. **Mobile-first en serio:** cada acción clave alcanzable con el pulgar. Áreas táctiles ≥ 44px.
2. **Jerarquía antes que decoración:** información más importante en el tamaño más grande.
3. **Densidad justa:** mostrar lo suficiente para decidir. Paginación, truncado y progresión son herramientas.
4. **Accesibilidad:** WCAG AA mínimo, contraste ≥ 4.5:1, soporte `prefers-reduced-motion`.

## Regla Crítica: Cero Input Manual de Fechas
**PROHIBIDO** usar inputs de texto libre (tipo `dd/mm/yyyy` o tipeo de horas) para selección de fechas u horarios.

## Componente de Calendario Interactivo (DatePicker)
- La reserva de turnos se realiza **exclusivamente** a través de un DatePicker moderno.
- El calendario debe bloquear visualmente (`disabled`) los días pasados.
- El calendario debe bloquear los días no laborables según la base de datos.
- Al seleccionar un día, el sistema renderiza **únicamente** los slots efectivamente disponibles calculados desde el backend.

## Panel de Administración — Directrices de Refactor Visual

### Alcance: Solo Frontend
**PROHIBIDO modificar** controladores, actions, API routes o lógica de backend. El refactor es **puramente visual**.

### Estándar de Visualización de Agenda
- Seguir el patrón **Google Calendar**: grilla temporal, vista día/semana, slots coloreados.
- **Verde** = Franja Positiva (horario de trabajo activo).
- **Rojo** = Franja Negativa (bloqueo, almuerzo, no disponible).
- Interacción diaria principal: **Tap-to-toggle** sobre la vista de calendario.

### Layout y Componentes
- Inputs actuales → transformar en **cards limpias** de configuración de bloques.
- En mobile: vista "Lista de bloques" o "Día completo" con selector de fecha superior.
- Preservar todos los campos actuales (Día de la semana, Franjas horarias Positivas/Negativas, Bloqueo de días específicos). Rediseñar la presentación, no la funcionalidad.

### Previsualización en Vivo
El panel debe mostrar al administrador una **vista previa en tiempo real** de cómo el cliente verá la disponibilidad resultante de la configuración actual.
