---
paths:
  - "tsconfig.json"
  - "**/*.d.ts"
  - "next.config.*"
  - "middleware.*"
---

# Debugging — Contexto Específico del Stack

> El protocolo completo de diagnóstico vive en la skill global `/diagnose`.
> Este archivo contiene solo los patrones de error específicos de este stack.

## Errores de Build Next.js
- Ante errores de módulos faltantes en edge runtime, verificar `serverExternalPackages` en `next.config`.
- El middleware corre en edge runtime: prohibido importar módulos Node.js nativos ahí. La config de Auth está separada en `lib/auth.config.ts` (edge) y `lib/auth.ts` (server).
- Errores de `"use client"` / `"use server"` suelen ser por importar un Server Component dentro de un Client Component.

## Errores de Prisma
- Ante errores de `prisma generate` o `prisma migrate`, leer el log completo antes de intentar fix.
- Si Prisma falla en build de Vercel, verificar que `prisma generate` esté en el script `build` de `package.json`.
- Nunca usar `@ts-ignore` ni `as any` para silenciar errores de tipos generados por Prisma — regenerar el cliente.
- El connection pooler de Neon no soporta `prisma migrate deploy` — no agregarlo al build script.

## Timezone (Trampa Conocida)
- El servidor fuerza `TZ=America/Argentina/Buenos_Aires` en `next.config.mjs`.
- Si un bug parece de "hora incorrecta", verificar que se esté usando `getHours()` (que respeta el TZ del server) y NO parsing manual de ISO strings o UTC offsets.
- Historial: hubo ~6 commits de ida y vuelta intentando UTC puro. La solución estable es TZ forzado.

## TypeScript
- Nunca usar `// @ts-ignore` o `as any` como solución permanente.
- Si el tipo es genuinamente desconocido, usar `unknown` + narrowing explícito.

## Vercel Deploy
- Variables de entorno requeridas: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- Para reset password links en producción, usar `VERCEL_URL` como fallback si `NEXTAUTH_URL` no está seteado.
- Service worker: el fetch handler debe hacer passthrough (`e.respondWith(fetch(e.request))`), no interceptar vacío.
