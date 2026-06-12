---
paths:
  - "tsconfig.json"
  - "**/*.d.ts"
  - "next.config.*"
  - "src/middleware.*"
---

# Debugging — Contexto Específico del Stack

> El protocolo completo de diagnóstico vive en la skill global `/diagnose`.
> Este archivo contiene solo los patrones de error específicos de este stack.

## Errores de Build Next.js
- Ante errores de módulos faltantes en edge runtime, verificar `serverExternalPackages` en `next.config`.
- El middleware corre en edge runtime: prohibido importar módulos Node.js nativos ahí. Separar la config de Auth en dos archivos (edge-compatible y server-side).
- Errores de `"use client"` / `"use server"` suelen ser por importar un Server Component dentro de un Client Component.

## Errores de Prisma
- Ante errores de `prisma generate` o `prisma migrate`, leer el log completo antes de intentar fix.
- Si Prisma falla en build de Vercel/Neon, verificar que `prisma generate` esté en el script `postinstall` o `build`.
- Nunca usar `@ts-ignore` ni `as any` para silenciar errores de tipos generados por Prisma — regenerar el cliente.

## TypeScript
- Nunca usar `// @ts-ignore` o `as any` como solución permanente.
- Si el tipo es genuinamente desconocido, usar `unknown` + narrowing explícito.
