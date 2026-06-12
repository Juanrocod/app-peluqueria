# CLAUDE.md — Contexto del Proyecto

## Stack Tecnológico
- **Framework:** Next.js 14+ con App Router
- **Estilos:** Tailwind CSS
- **ORM:** Prisma
- **Base de datos:** Neon DB (PostgreSQL serverless)
- **Auth:** NextAuth / Auth.js (jose v5, edge-compatible)

## Regla de Oro: Directiva de Estabilidad
1. **NO** refactorizar, modificar ni eliminar lógica existente, modelos de base de datos, ni componentes que ya funcionan sin autorización explícita del usuario.
2. Toda nueva implementación debe integrarse de forma **modular y aditiva**.
3. Antes de correr `prisma migrate`, proponer el cambio y esperar aprobación.
4. El refactor del panel de administración es **solo frontend**: prohibido tocar backend, actions o API routes.

## Memoria Permanente (MCP)
- **Servidor:** `claude-mem` en puerto `37777` (local).
- Grabar decisiones arquitectónicas clave, esquemas y flujos para mantener contexto entre sesiones.
- Consultar memoria al inicio de cada sesión antes de planificar cambios.

## Reglas Contextuales (Inyección por Path)
Las reglas detalladas se inyectan automáticamente según el archivo en edición:
- **Frontend / UI:** `.claude/rules/frontend.md`
- **Backend / Motor de turnos:** `.claude/rules/backend.md`
- **Base de datos / Seguridad:** `.claude/rules/database.md`
- **Debugging TypeScript:** `.claude/rules/debugging.md`
