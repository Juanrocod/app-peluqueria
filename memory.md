# 🎯 CLAUDE.md - Manual de Operaciones, Protocolos y Misión Actual

Este archivo define el ecosistema de herramientas, las reglas de oro y el plan de ejecución activo para el agente durante el desarrollo de este proyecto.

## 📋 Reglas de Oro (Obligatorio)
1. **Lectura Preventiva:** ANTES de escribir una sola línea de código, debes leer y asimilar la skill local ubicada en `./.claude/skills/reglas_negocio.md`.
2. **Modularidad Estricta:** PROHIBIDO romper código existente. Las integraciones de backend y frontend deben ser aisladas y modulares.
3. **Pensamiento Tech Lead:** Utilizá el framework de subagentes (`superpowers`) para planificar, revisar código y testear antes de ejecutar cambios en los archivos.

---

## 🛡️ Protocolo de Herramientas 360 (Gatillos de Uso)

### 1. Memoria Permanente (MCP)
* **Herramienta:** `claude-mem` (Servidor local puerto 37777).
* **Uso:** Siempre activo. Grabá las decisiones arquitectónicas clave, esquemas y flujos para mantener el contexto entre sesiones.

### 2. Calidad Visual y Frontend (Skills Globales)
* **Herramientas:** `ui-ux-pro-max` e `impeccable`
* **Uso:** Estrictamente al crear o modificar vistas, componentes visuales o estilos CSS.
* **Protocolo:** Diseñá la estructura con `ui-ux-pro-max`. Al finalizar el componente, ejecutá una revisión mental basada en `/impeccable` para pulir espaciados, sombras y terminación premium.

### 3. Debugging Quirúrgico (Skill)
* **Herramienta:** `diagnose` (Método Matt Pocock)
* **Uso:** Ante cualquier error de compilación, TypeScript o fallos en consola.
* **Protocolo:** Prohibido tirar parches a ciegas. Desarmá el error paso a paso desde su raíz lógica.

### 4. Ciberseguridad y Blindaje (Plugin)
* **Herramienta:** `security-guidance`
* **Uso:** Al diseñar endpoints, APIs, middleware y esquemas de base de datos.
* **Protocolo:** Aplicar máxima compartimentación. Asegurar que los datos sensibles estén completamente cegados ante intentos de extracción externa o scraping.

---

## 🗺️ Plan de Ejecución Actual (Paso a Paso)

### Fase 1: Auditoría y Modelado de Datos (Backend)
- Revisar el esquema de Prisma actual (`schema.prisma`).
- Asegurar los modelos necesarios para soportar la lógica de "Franjas Positivas" (abierto), "Franjas Negativas" (bloqueado/almuerzo) y "Slots de Turnos".
- Proponer cambios en el esquema y pedir aprobación explícita antes de correr migraciones.

### Fase 2: Componente Calendario Interactivo (Frontend Cliente)
- Reemplazar cualquier input manual de fechas (`dd/mm/yyyy`) en el flujo de reserva del cliente.
- Implementar un componente de calendario visual moderno (`DatePicker`).
- Deshabilitar días pasados y no laborables; mostrar únicamente horarios disponibles calculados desde el backend.

### Fase 3: Dashboard Visual (Frontend Administrador)
- Crear o modificar la vista de horarios del panel de administración.
- Implementar una interfaz tipo "Grilla" o "Time-block" visual interactiva.
- Permitir la selección e inactivación de franjas horarias de forma intuitiva, sin tipeo manual de fechas.

---

## 📝 Bitácora de Progreso (Para uso del Agente)
*(Claude: Modificá este checklist a medida que completes las fases y anota problemas o soluciones clave aquí para no perder el hilo entre sesiones).*

- [ ] Fase 1 pendiente...
- [ ] Fase 2 pendiente...
- [ ] Fase 3 pendiente...