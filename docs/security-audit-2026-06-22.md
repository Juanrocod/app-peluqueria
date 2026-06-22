# Security Audit Report -- Agenda Turnos Peluqueria

**Date:** 2026-06-22
**Auditor:** Claude (automated)
**Branch:** Desarrollo
**Stack:** Next.js 15 (App Router), Prisma 6, NextAuth 5 (JWT), Neon DB, Vercel
**Scope:** All API routes, server actions, middleware, auth, booking forms, schema, config

---

## 1. Attack Surface Map

### API Routes

| Route | Method | Auth Required | Auth Check | Public? | Notes |
|-------|--------|---------------|------------|---------|-------|
| `/api/auth/[...nextauth]` | GET/POST | N/A | NextAuth internal | Yes | Login/session endpoints |
| `/api/validar-descuento` | GET | None | None | Yes | Validates discount codes |
| `/api/disponibilidad` | GET | None | None | Yes | Returns available time slots for a date |
| `/api/disponibilidad/mes` | GET | None | None | Yes | Returns available days for a month |
| `/api/admin/horarios` | POST | Yes | `auth()` + role === "ADMIN" | No | Modifies business hours grid |

### Server Actions (Admin -- all protected by `requireAdmin()`)

| Action | File | Auth |
|--------|------|------|
| `actualizarEstadoTurno` | `actions/turnos.ts` | requireAdmin() |
| `eliminarTurno` | `actions/turnos.ts` | requireAdmin() |
| `crearServicio` | `actions/servicios.ts` | requireAdmin() |
| `actualizarServicio` | `actions/servicios.ts` | requireAdmin() |
| `eliminarServicio` | `actions/servicios.ts` | requireAdmin() |
| `crearFranja` | `actions/horarios.ts` | requireAdmin() |
| `crearFranjaAdmin` | `actions/horarios.ts` | requireAdmin() |
| `eliminarFranjaAdmin` | `actions/horarios.ts` | requireAdmin() |
| `actualizarFranja` | `actions/horarios.ts` | requireAdmin() |
| `eliminarFranja` | `actions/horarios.ts` | requireAdmin() |
| `copiarFranjasATodos` | `actions/horarios.ts` | requireAdmin() |
| `toggleFranja` | `actions/horarios.ts` | requireAdmin() |
| `crearBloqueoAdmin` | `actions/bloqueos.ts` | requireAdmin() |
| `crearBloqueo` | `actions/bloqueos.ts` | requireAdmin() |
| `actualizarBloqueo` | `actions/bloqueos.ts` | requireAdmin() |
| `eliminarBloqueo` | `actions/bloqueos.ts` | requireAdmin() |
| `crearProducto` | `actions/catalogo.ts` | requireAdmin() |
| `actualizarProducto` | `actions/catalogo.ts` | requireAdmin() |
| `eliminarProducto` | `actions/catalogo.ts` | requireAdmin() |
| `setConfiguracion` | `actions/configuracion.ts` | requireAdmin() |
| `crearCodigo` | `actions/configuracion.ts` | requireAdmin() |
| `desactivarCodigo` | `actions/configuracion.ts` | requireAdmin() |

### Server Actions (Public -- NO auth)

| Action | File | Auth | Notes |
|--------|------|------|-------|
| `crearTurno` | `actions/turnos.ts` | **NONE** | Public booking -- by design |
| `getConfiguracion` | `actions/configuracion.ts` | **NONE** | Reads all config keys |
| `getCodigoActivo` | `actions/configuracion.ts` | **NONE** | Returns active discount code |
| `registrarPeluquero` | `actions/auth.ts` | **NONE** | Guarded by "admin exists" check |
| `requestPasswordReset` | `actions/password-reset.ts` | **NONE** | By design |
| `executePasswordReset` | `actions/password-reset.ts` | **NONE** | Token-based |
| `logout` | `app/actions/auth-actions.ts` | **NONE** | Calls signOut |

### Middleware

| Path pattern | Protection |
|--------------|------------|
| `/admin/*` | Redirects to `/login` if not logged in |
| `/api/admin/*` | Redirects to `/login` if not logged in |
| `/login` | Redirects to `/admin` if already logged in |
| `/registro` | Redirects to `/admin` if already logged in |
| Everything else | No middleware protection |

### Pages

| Page | Auth | Server-side data |
|------|------|------------------|
| `/reservar` | None (public) | Loads services, products, config |
| `/admin/*` (all) | Middleware redirect | Direct Prisma queries (no role check in page) |
| `/login` | None | Server action for signIn |
| `/registro` | None | Checks if admin exists before showing form |
| `/forgot-password` | None | Calls requestPasswordReset |
| `/reset-password` | None | Token-based password reset |

---

## 2. Findings

### CRITICAL

| # | Finding | File(s) | Detail | Remediation |
|---|---------|---------|--------|-------------|
| C1 | **No rate limiting on any endpoint** | All routes, all actions | No rate limiting anywhere: login, password reset, booking, discount code validation. An attacker can brute-force the login (`/login` form action), enumerate discount codes (`/api/validar-descuento?codigo=XXXXX`), or spam bookings via `crearTurno`. | Add rate limiting via Vercel Edge middleware, `upstash/ratelimit`, or similar. Priority targets: login (max 5/min per IP), password reset (max 3/min per email), `crearTurno` (max 10/min per IP), discount validation (max 20/min per IP). |
| C2 | **Race condition in `crearTurno` -- double booking** | `actions/turnos.ts` lines 51-56 | `crearTurno` does check-then-create WITHOUT a database transaction or row-level lock. Two simultaneous requests for the same slot can both pass the `slotsDisponibles.includes(horaStr)` check and both create appointments. The `duracionSnapshot` field is informational only -- it does not enforce a constraint. | Wrap the availability check + insert in a Prisma `$transaction` with serializable isolation, OR add a unique constraint on `(fechaHora, estado)` for non-cancelled appointments, OR use a `SELECT ... FOR UPDATE` style advisory lock. |
| C3 | **Race condition in `registrarPeluquero` -- multiple admins** | `actions/auth.ts` lines 13-14 | Same check-then-create pattern: two concurrent requests can both see `adminExists === null` and create two ADMIN users. This subverts the single-tenant security model entirely. | Wrap in a serializable transaction, or add a unique partial index `WHERE rol = 'ADMIN'` in the DB to enforce at most one admin row. |

### HIGH

| # | Finding | File(s) | Detail | Remediation |
|---|---------|---------|--------|-------------|
| H1 | **`crearTurno` is unauthenticated with no input validation** | `actions/turnos.ts` | Anyone can call this server action with arbitrary data. No validation on: `clienteNombre` (could be 100KB string), `clienteTelefono` (no format check), `clienteEmail` (no format check), `observaciones` (unbounded), `direccion` (unbounded), `servicioId` (only checked against DB but no format), `productoIds` (unbounded array), `descuentoAplicado` (any number, including negative -- attacker can set -100 to inflate price display or 200 to show negative). | Add Zod schema validation with max lengths (nombre <= 100, telefono <= 30, observaciones <= 500, etc.). Validate `descuentoAplicado` is between 0-100. Limit `productoIds` array size. |
| H2 | **Discount code brute-force / enumeration** | `api/validar-descuento/route.ts` | The endpoint takes any string, uppercases it, and checks against the DB. No rate limiting, no account required. Discount codes appear to be 5 characters (UI enforces `maxLength={5}` in one form but not in BookingForm). An attacker can enumerate all possible 5-char codes with ~12M requests. | Rate limit this endpoint. Consider adding a CAPTCHA or tying validation to an in-progress booking session. |
| H3 | **Password reset token logged to console in production** | `actions/password-reset.ts` line 32 | `console.log(\`[RESET] ${baseUrl}/reset-password?token=${rawToken}\`)` prints the raw reset token to server logs. In Vercel, these logs are accessible from the dashboard. Any team member with Vercel access can see reset tokens and take over the admin account. | Remove the console.log or replace with actual email sending. At minimum, conditionally log only in development: `if (process.env.NODE_ENV !== 'production')`. |
| H4 | **Middleware checks authentication but not authorization (role)** | `middleware.ts`, `lib/auth.config.ts` | The middleware only checks `!!auth?.user` for `/admin/*` routes. It does NOT check `role === 'ADMIN'`. If a CLIENTE user exists (the schema has `RolUsuario.CLIENTE`), they could access all admin pages. The individual server actions check `requireAdmin()`, but admin pages render sensitive data (turnos, ganancias, client names/phones) via direct Prisma queries without role verification. | Add role check to the `authorized` callback: `if (isAdminRoute && (auth?.user as any)?.role !== 'ADMIN') return Response.redirect(...)`. |
| H5 | **`imagenUrl` stored and rendered without validation -- Stored XSS vector** | `actions/catalogo.ts`, `components/booking/FormularioReserva.tsx` line 459, `components/admin/ProductoEditable.tsx` line 64 | Admin can set `imagenUrl` to any string. It is rendered as `<img src={imagenUrl}>`. While React escapes attributes, a `javascript:` URI in an `<img src>` won't execute, but the `imagenUrl` from `marca_imagen_fondo` config is used in an inline `style` attribute (`backgroundImage: \`url(${imagenFondo})\``) in `app/reservar/page.tsx` line 63. A malicious value like `); background: red; content: url(javascript:alert(1)` could break out of the CSS context. | Validate that all URLs are `https://` before storing. Sanitize the CSS context by wrapping in `CSS.escape()` or only allowing URLs matching a whitelist pattern. |

### MEDIUM

| # | Finding | File(s) | Detail | Remediation |
|---|---------|---------|--------|-------------|
| M1 | **No server-side input validation in any server action** | All files in `actions/` | None of the server actions validate input with a schema library (Zod, Yup, etc.). TypeScript types provide compile-time safety but are erased at runtime. A crafted HTTP request can send: numbers as strings, missing fields, extremely long strings, or unexpected types. Prisma provides some protection (type coercion, constraint checking) but not length limits or format validation. | Add Zod validation schemas for every server action. Example: `nombre: z.string().min(1).max(100)`, `telefono: z.string().regex(/^\+?[\d\s-]{7,20}$/)`. |
| M2 | **`getConfiguracion` exposes all config keys without auth** | `actions/configuracion.ts` line 7-9 | Returns ALL rows from `ConfiguracionApp` table as a key-value map. Currently contains brand info, but if sensitive config is ever added to this table (API keys, webhook secrets), it would be publicly readable. | Either add `requireAdmin()` to this action, or explicitly whitelist which keys are returned to unauthenticated callers. |
| M3 | **`getCodigoActivo` leaks the active discount code** | `actions/configuracion.ts` line 23-25 | Returns the full active discount code object (including the code itself) without authentication. A client could call this action directly to get the discount code instead of typing it. | Add `requireAdmin()` or return only a boolean indicating whether a code exists (not the code itself). |
| M4 | **No Content-Security-Policy headers** | `next.config.ts`, `middleware.ts` | No CSP headers are set. If XSS is achieved (e.g., via H5), there are no restrictions on script execution, data exfiltration, or resource loading. | Add CSP headers in `next.config.ts` via the `headers` config or in middleware. At minimum: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:`. |
| M5 | **No CSRF protection beyond Next.js defaults** | All server actions | Next.js server actions include built-in CSRF protection via the `Origin` header check. This is good, BUT the API routes (`/api/validar-descuento`, `/api/disponibilidad/*`) are standard GET endpoints with no CSRF concerns (read-only). The `/api/admin/horarios` POST route has proper auth. No custom CSRF tokens are needed given the framework protection, but this should be documented as a dependency on Next.js internals. | Document that CSRF protection depends on Next.js server action Origin header validation. Ensure no `POST` API routes bypass this. |
| M6 | **Admin pages do server-side data fetching without role check** | `app/admin/page.tsx`, all admin pages | Admin pages query Prisma directly for sensitive data (client names, phone numbers, appointment details, financial data). The middleware redirects unauthenticated users, but does NOT verify the role. If a non-admin session exists, the page renders all data. | Add `await requireAdmin()` at the top of every admin page's server component, or fix the middleware to check roles (see H4). |

### LOW

| # | Finding | File(s) | Detail | Remediation |
|---|---------|---------|--------|-------------|
| L1 | **`descuentoAplicado` is client-controlled and stored as-is** | `actions/turnos.ts` line 71 | The discount percentage comes from the client. An attacker can set `descuentoAplicado: 100` (or any value) regardless of whether they actually validated a code. The server never re-validates the discount code during booking creation. | Re-validate the discount server-side in `crearTurno`: accept a `codigoDescuento` string instead of a percentage, look it up, and apply the percentage from the DB. |
| L2 | **No password complexity requirements beyond length** | `actions/auth.ts`, `actions/password-reset.ts` | Only checks `password.length < 8`. No requirement for mixed case, numbers, or special characters. | Consider adding complexity requirements or using a library like `zxcvbn` for password strength scoring. |
| L3 | **Soft-delete pattern inconsistent** | Various | `eliminarServicio` and `eliminarProducto` use soft-delete (`activo: false`), but `eliminarFranja` and `eliminarFranjaAdmin` use hard delete (`prisma.delete`). Similarly `eliminarBloqueo` uses hard delete. This is not a security vulnerability per se, but hard-deleted records cannot be audited. | Standardize on soft-delete for audit trail, or accept this as intentional for ephemeral records. |
| L4 | **No audit logging** | All actions | No audit trail for admin actions (who changed what, when). In a dispute about appointments or financial data, there is no evidence trail. | Add a simple audit log table recording: action, userId, timestamp, before/after payload. |
| L5 | **`TZ` not set in `next.config.ts`** | `next.config.ts` | The backend rules document says `TZ=America/Argentina/Buenos_Aires` should be forced in `next.config.mjs`, but the actual `next.config.ts` does not set any environment variables. This may already be set in Vercel env vars, but if not, timezone calculations could be wrong. | Verify `TZ` is set in Vercel environment variables, or add `env: { TZ: 'America/Argentina/Buenos_Aires' }` to `next.config.ts`. |
| L6 | **Service worker passes all requests through** | `public/sw.js` | The service worker does `e.respondWith(fetch(e.request))` which is a no-op passthrough. This is safe but provides no offline functionality. If offline support is not planned, consider removing the SW to reduce attack surface. | Remove SW if not needed, or implement proper caching strategy if offline support is desired. |

---

## 3. What's Already Done Well

1. **Password hashing:** bcrypt with salt rounds of 10 -- proper and secure. No plaintext passwords anywhere.

2. **JWT strategy with proper token enrichment:** The auth config correctly propagates `role` through JWT -> session callbacks. No session database dependency means faster auth checks.

3. **Consistent `requireAdmin()` guard on all admin server actions:** Every single admin mutation action calls `requireAdmin()` at the top. No admin action was found without this guard.

4. **Admin API route has proper auth:** `/api/admin/horarios` checks `auth()` and verifies `role === 'ADMIN'` before processing.

5. **Good input validation on `/api/admin/horarios`:** The `validarBody()` function does manual validation of the request body with proper type checking, regex for hours, enum validation, and array size limits (max 500).

6. **Password reset tokens are hashed:** The raw token is never stored in the DB -- only the SHA-256 hash. Tokens expire after 1 hour. Used tokens are immediately deleted. This is textbook secure implementation.

7. **Registration locked after first admin:** `registrarPeluquero` and the `/registro` page both check if an admin already exists, preventing unauthorized registration in the normal case.

8. **No raw SQL:** Zero uses of `$queryRaw` or `$executeRaw` -- all database access is through Prisma's type-safe query builder, eliminating SQL injection risk.

9. **No `dangerouslySetInnerHTML` with user data:** The only use is for a static service worker registration script string. User-supplied data is always rendered through React's JSX escaping.

10. **`.env` is properly gitignored:** Confirmed `.env` and `.env*.local` are in `.gitignore` and not tracked by git.

11. **Prisma client singleton pattern:** The global prisma pattern in `lib/prisma.ts` prevents connection exhaustion in development.

12. **Database credentials in env vars:** `DATABASE_URL` is read from environment, not hardcoded.

13. **Soft deletes for business data:** Services and products use `activo: false` rather than hard delete, preserving referential integrity.

14. **Availability check before booking:** `crearTurno` validates the selected slot against real-time availability before creating the appointment.

15. **Snapshot pattern for financial data:** When a turno is marked COMPLETADO, prices are snapshotted to prevent retroactive changes from affecting historical financial records.

---

## 4. Priority Remediation Roadmap

### Before Production (must-fix)

1. **Fix C1:** Add rate limiting to login, password reset, and booking endpoints
2. **Fix C2:** Wrap `crearTurno` in a serializable transaction
3. **Fix C3:** Wrap `registrarPeluquero` in a serializable transaction or add a DB constraint
4. **Fix H3:** Remove the `console.log` of reset tokens
5. **Fix H4/M6:** Add role check to middleware or admin pages

### Soon After Launch

6. **Fix H1:** Add Zod validation to `crearTurno`
7. **Fix M1:** Add Zod validation to all server actions
8. **Fix L1:** Re-validate discount codes server-side during booking
9. **Fix H5:** Validate URLs before storing; sanitize CSS context
10. **Fix M4:** Add Content-Security-Policy headers

### When Convenient

11. **Fix M2/M3:** Restrict public config/discount code exposure
12. **Fix H2:** Rate limit or CAPTCHA for discount code validation
13. **Fix L4:** Add audit logging
14. **Fix L2:** Strengthen password requirements
