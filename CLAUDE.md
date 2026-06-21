# CLAUDE.md — Contexto del Proyecto

## Producto
App de gestión de turnos para peluqueros/barberos. Single-tenant (1 peluquero = 1 admin). El peluquero gestiona desde mobile (PWA); los clientes reservan via formulario web público.

## Fase Actual: Pulido Pre-Producción
- La app está funcionalmente completa. Prioridad: ajuste fino visual, micro-bugs, consistencia entre pantallas.
- NO agregar features nuevas sin autorización explícita.
- Referencia de diseño objetivo: `designs/design_handoff_completo.txt` y `designs/comparacion/esperado/`

## Stack
- **Framework:** Next.js 15 (App Router)
- **Estilos:** Tailwind CSS v4 (tokens `@theme` en `globals.css`)
- **ORM:** Prisma 6
- **Base de datos:** Neon DB (PostgreSQL serverless, connection pooler)
- **Auth:** NextAuth 5 beta (JWT strategy, jose v5, edge-compatible)
- **Deploy:** Vercel
- **Fuentes:** Playfair Display, Manrope, JetBrains Mono (via `next/font/google`)
- **Iconos:** Lucide React (SVG stroke)

## Estructura de Carpetas (sin `src/`)
```
app/              → Pages y API routes (App Router)
actions/          → Server actions
components/       → UI (admin/, mobile/, booking/, ui/)
lib/              → Auth, Prisma client, disponibilidad
prisma/           → Schema y migraciones
designs/          → Handoff de diseño y screenshots de referencia
public/           → Assets estáticos, manifest, service worker
```

## Regla de Oro: Directiva de Estabilidad
1. **NO** refactorizar, modificar ni eliminar lógica existente, modelos de base de datos, ni componentes que ya funcionan sin autorización explícita del usuario.
2. Toda nueva implementación debe integrarse de forma **modular y aditiva**.
3. Antes de correr `prisma migrate`, proponer el cambio y esperar aprobación.

## Reglas Contextuales (Inyección por Path)
Se inyectan automáticamente según el archivo en edición:
- **Frontend / UI:** `.claude/rules/frontend.md`
- **Backend / Motor de turnos:** `.claude/rules/backend.md`
- **Base de datos / Seguridad:** `.claude/rules/database.md`
- **Debugging TypeScript:** `.claude/rules/debugging.md`

<!-- ## Memoria Permanente (MCP)
Deshabilitado — servidor `claude-mem` (puerto 37777) desinstalado por errores.
Cuando se reinstale, usarlo para grabar decisiones arquitectónicas clave y
consultar memoria al inicio de cada sesión antes de planificar cambios.
-->
