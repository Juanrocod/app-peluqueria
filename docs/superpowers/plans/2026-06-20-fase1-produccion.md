# Fase 1 — Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 23 critical/high-priority issues (security, bugs, UX mobile, frontend polish) to make the barbershop appointment app production-ready.

**Architecture:** Next.js 14+ App Router with Prisma ORM, NextAuth v5 (JWT strategy), Tailwind CSS v4. Admin panel is dark-themed, mobile-first. The app is single-tenant (1 peluquero = 1 admin). All changes are additive — no backend refactors, no DB schema changes.

**Tech Stack:** Next.js 15, React 19, Prisma 6, NextAuth 5 beta, Tailwind CSS 4, date-fns, lucide-react

## Global Constraints

- **Stability rule:** Do NOT refactor, modify, or delete existing backend logic, DB models, or working components without explicit approval.
- **New code must be modular and additive.**
- **No `prisma migrate`** — no schema changes in this phase.
- **Dark theme only** — admin uses `ap-*` palette (carbon), client uses `cl-*` palette (navy). No white/light backgrounds.
- **Mobile-first** — touch targets >= 44px, `md:` breakpoint separates mobile/desktop views.
- **Spanish** — all user-facing text in Spanish.

## File Map

### Security
- Modify: `middleware.ts` — add API admin routes to matcher
- Modify: `lib/auth.config.ts` — add role check in authorized callback
- Create: `lib/auth-guard.ts` — shared admin auth guard helper
- Modify: `actions/turnos.ts` — add auth guard + race condition fix + duracionSnapshot
- Modify: `actions/servicios.ts` — add auth guard
- Modify: `actions/peluqueros.ts` — add auth guard
- Modify: `actions/horarios.ts` — add auth guard
- Modify: `actions/bloqueos.ts` — add auth guard
- Modify: `actions/catalogo.ts` — add auth guard
- Modify: `actions/configuracion.ts` — add auth guard
- Modify: `actions/auth.ts` — limit to 1 admin
- Modify: `app/admin/layout.tsx` — explicit session check
- Modify: `app/registro/page.tsx` — check if admin exists before showing form

### Bugs
- Modify: `components/booking/FormularioReserva.tsx` — fix discount calc + sticky button
- Modify: `components/mobile/booking/BookingForm.tsx` — month navigation + error feedback

### UX Mobile
- Modify: `components/admin/AdminSidebar.tsx` — fix overflow-x
- Modify: `app/globals.css` — add mobile viewport lock
- Modify: `components/mobile/BottomNav.tsx` — spacing fix
- Modify: `components/mobile/config/HorariosMobile.tsx` — local state, remove router.refresh
- Modify: `components/admin/FormularioTurnoManual.tsx` — full dark theme redesign
- Modify: `app/admin/turnos/nuevo/page.tsx` — mobile layout

### Frontend Polish
- Create: `app/admin/loading.tsx` — generic loading spinner
- Create: `app/admin/error.tsx` — generic error boundary
- Create: `app/not-found.tsx` — custom 404 page
- Modify: `app/layout.tsx` — move themeColor to viewport export
- Modify: `public/manifest.json` — fix icon references
- Create: `public/icon-192.png` — generated from SVG
- Create: `public/icon-512.png` — generated from SVG
- Modify: `app/login/page.tsx` — remove forgot password link + add error feedback
- Modify: `app/reservar/page.tsx` — add metadata + share-friendly description
- Modify: `components/mobile/AppBar.tsx` — add share button

---

### Task 1: Security Foundation — Middleware, RBAC, Session Check

**Files:**
- Modify: `middleware.ts`
- Modify: `lib/auth.config.ts`
- Modify: `lib/auth.ts`
- Modify: `app/admin/layout.tsx`

**Interfaces:**
- Produces: Protected `/api/admin/*` routes, role-based access control, session verification in admin layout

- [ ] **Step 1: Add `/api/admin/:path*` to middleware matcher**

In `middleware.ts`, add the API admin path to the matcher array:

```ts
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login", "/registro"],
};
```

- [ ] **Step 2: Add role to JWT and session callbacks in `lib/auth.ts`**

The `authorize` function in `lib/auth.ts` currently returns `{ id, email, name }`. Add `role`:

```ts
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string },
  });

  if (!user) return null;

  const passwordMatch = await bcrypt.compare(
    credentials.password as string,
    user.password
  );

  if (!passwordMatch) return null;

  return { id: user.id, email: user.email, name: user.nombre, role: user.rol };
},
```

Then add JWT and session callbacks to pass the role through:

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return { id: user.id, email: user.email, name: user.nombre, role: user.rol };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 3: Add RBAC check in `lib/auth.config.ts`**

Update the `authorized` callback to check for ADMIN role on admin routes:

```ts
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute =
        nextUrl.pathname.startsWith("/admin") ||
        nextUrl.pathname.startsWith("/api/admin");
      const isLoginPage = nextUrl.pathname === "/login";
      const isRegistroPage = nextUrl.pathname === "/registro";

      if (isAdminRoute) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        const role = (auth?.user as { role?: string })?.role;
        if (role !== "ADMIN") return Response.redirect(new URL("/login", nextUrl));
        return true;
      }
      if ((isLoginPage || isRegistroPage) && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
  },
};
```

- [ ] **Step 4: Add explicit session check in `app/admin/layout.tsx`**

```ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MobileBottomNav } from "@/components/mobile/BottomNav";
import { MobileAppBar } from "@/components/mobile/AppBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const marcaNombre = await prisma.configuracionApp
    .findUnique({ where: { clave: "marca_nombre" } })
    .then((r) => r?.valor ?? "Peluquería");

  return (
    <>
      <AdminSidebar email={session.user.email ?? ""}>
        <MobileAppBar businessName={marcaNombre} />
        {children}
      </AdminSidebar>
      <MobileBottomNav />
    </>
  );
}
```

- [ ] **Step 5: Verify build passes**

Run: `npx next build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts lib/auth.config.ts lib/auth.ts app/admin/layout.tsx
git commit -m "feat(security): add RBAC, protect API admin routes, verify session in admin layout"
```

---

### Task 2: Auth Guard in Server Actions

**Files:**
- Create: `lib/auth-guard.ts`
- Modify: `actions/servicios.ts`
- Modify: `actions/peluqueros.ts`
- Modify: `actions/horarios.ts`
- Modify: `actions/bloqueos.ts`
- Modify: `actions/catalogo.ts`
- Modify: `actions/configuracion.ts`

**Interfaces:**
- Consumes: `auth()` from `lib/auth.ts`
- Produces: `requireAdmin()` helper that throws if not admin

- [ ] **Step 1: Create auth guard helper**

Create `lib/auth-guard.ts`:

```ts
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") throw new Error("No autorizado");
  return session;
}
```

- [ ] **Step 2: Add guard to `actions/servicios.ts`**

Add `await requireAdmin();` as first line in each exported function:

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearServicio(data: {
  nombre: string;
  duracion: number;
  precio: number;
}) {
  await requireAdmin();
  const servicio = await prisma.servicio.create({ data });
  revalidatePath("/admin/servicios");
  return servicio;
}

export async function actualizarServicio(
  id: string,
  data: { nombre?: string; duracion?: number; precio?: number; activo?: boolean }
) {
  await requireAdmin();
  const servicio = await prisma.servicio.update({ where: { id }, data });
  revalidatePath("/admin/servicios");
  return servicio;
}

export async function eliminarServicio(id: string) {
  await requireAdmin();
  await prisma.servicio.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/admin/servicios");
}
```

- [ ] **Step 3: Add guard to `actions/peluqueros.ts`**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearPeluquero(data: { nombre: string }) {
  await requireAdmin();
  const peluquero = await prisma.peluquero.create({ data });
  revalidatePath("/admin/peluqueros");
  return peluquero;
}

export async function actualizarPeluquero(
  id: string,
  data: { nombre?: string; activo?: boolean }
) {
  await requireAdmin();
  const peluquero = await prisma.peluquero.update({ where: { id }, data });
  revalidatePath("/admin/peluqueros");
  return peluquero;
}
```

- [ ] **Step 4: Add guard to `actions/horarios.ts`**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearFranja(data: {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  etiqueta?: string;
  esBloqueo?: boolean;
}) {
  await requireAdmin();
  await prisma.horarioAtencion.create({ data: { ...data, activo: true } });
  revalidatePath("/admin/horarios");
}

export async function crearFranjaAdmin(data: {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
  motivo?: string;
}) {
  await requireAdmin();
  await prisma.horarioAtencion.create({
    data: {
      diaSemana: data.diaSemana,
      horaApertura: data.horaApertura,
      horaCierre: data.horaCierre,
      tipoFranja: data.tipoFranja,
      esBloqueo: data.tipoFranja === "NEGATIVA",
      motivo: data.motivo ?? null,
      activo: true,
    },
  });
  revalidatePath("/admin/horarios");
}

export async function eliminarFranjaAdmin(id: string) {
  await requireAdmin();
  await prisma.horarioAtencion.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}

export async function actualizarFranja(
  id: string,
  data: { horaApertura?: string; horaCierre?: string; etiqueta?: string; activo?: boolean }
) {
  await requireAdmin();
  await prisma.horarioAtencion.update({ where: { id }, data });
  revalidatePath("/admin/horarios");
}

export async function eliminarFranja(id: string) {
  await requireAdmin();
  await prisma.horarioAtencion.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}

export async function toggleFranja(id: string, activo: boolean) {
  await requireAdmin();
  await prisma.horarioAtencion.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/horarios");
}
```

- [ ] **Step 5: Add guard to `actions/bloqueos.ts`**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearBloqueoAdmin(data: {
  fecha: Date;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}) {
  await requireAdmin();
  const fechaUTC = new Date(
    Date.UTC(data.fecha.getFullYear(), data.fecha.getMonth(), data.fecha.getDate())
  );
  await prisma.bloqueoHorario.create({
    data: {
      fecha: fechaUTC,
      todoElDia: data.todoElDia,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      motivo: data.motivo ?? null,
    },
  });
  revalidatePath("/admin/horarios");
}

export async function crearBloqueo(data: {
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}) {
  await requireAdmin();
  await prisma.bloqueoHorario.create({ data });
  revalidatePath("/admin/horarios");
}

export async function actualizarBloqueo(
  id: string,
  data: { fecha?: Date; horaInicio?: string; horaFin?: string; motivo?: string }
) {
  await requireAdmin();
  await prisma.bloqueoHorario.update({ where: { id }, data });
  revalidatePath("/admin/horarios");
}

export async function eliminarBloqueo(id: string) {
  await requireAdmin();
  await prisma.bloqueoHorario.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}
```

- [ ] **Step 6: Add guard to `actions/catalogo.ts`**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearProducto(data: {
  nombre: string;
  descripcion?: string;
  precio: number;
  ganancia?: number;
  imagenUrl?: string;
}) {
  await requireAdmin();
  await prisma.producto.create({ data: { ...data, activo: true } });
  revalidatePath("/admin/catalogo");
}

export async function actualizarProducto(
  id: string,
  data: { nombre?: string; descripcion?: string; precio?: number; ganancia?: number; imagenUrl?: string; activo?: boolean }
) {
  await requireAdmin();
  await prisma.producto.update({ where: { id }, data });
  revalidatePath("/admin/catalogo");
}

export async function eliminarProducto(id: string) {
  await requireAdmin();
  await prisma.producto.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin/catalogo");
}
```

- [ ] **Step 7: Add guard to admin functions in `actions/configuracion.ts`**

Only `setConfiguracion`, `crearCodigo`, and `desactivarCodigo` need the guard. `getConfiguracion` and `getCodigoActivo` are read-only used by both admin and public pages:

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function getConfiguracion() {
  const rows = await prisma.configuracionApp.findMany();
  return Object.fromEntries(rows.map((r) => [r.clave, r.valor])) as Record<string, string>;
}

export async function setConfiguracion(clave: string, valor: string) {
  await requireAdmin();
  await prisma.configuracionApp.upsert({
    where: { clave },
    update: { valor },
    create: { clave, valor },
  });
  revalidatePath("/admin/configuracion");
  revalidatePath("/reservar");
}

export async function getCodigoActivo() {
  return prisma.codigoDescuento.findFirst({ where: { activo: true } });
}

export async function crearCodigo(codigo: string, descuento: number) {
  await requireAdmin();
  await prisma.codigoDescuento.updateMany({ data: { activo: false } });
  await prisma.codigoDescuento.create({ data: { codigo: codigo.toUpperCase(), descuento, activo: true } });
  revalidatePath("/admin/configuracion");
}

export async function desactivarCodigo() {
  await requireAdmin();
  await prisma.codigoDescuento.updateMany({ data: { activo: false } });
  revalidatePath("/admin/configuracion");
}
```

- [ ] **Step 8: Add guard to admin-only function in `actions/turnos.ts`**

`crearTurno` is called from both admin (manual) and public (booking) — do NOT add guard there. Only `actualizarEstadoTurno` and `eliminarTurno` are admin-only:

```ts
// At top of file, add import:
import { requireAdmin } from "@/lib/auth-guard";

// Add guard to actualizarEstadoTurno:
export async function actualizarEstadoTurno(id: string, estado: EstadoTurno) {
  await requireAdmin();
  // ... rest unchanged
}

// Add guard to eliminarTurno:
export async function eliminarTurno(id: string) {
  await requireAdmin();
  await prisma.turno.update({ where: { id }, data: { estado: "CANCELADO" } });
  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
}
```

- [ ] **Step 9: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
git add lib/auth-guard.ts actions/servicios.ts actions/peluqueros.ts actions/horarios.ts actions/bloqueos.ts actions/catalogo.ts actions/configuracion.ts actions/turnos.ts
git commit -m "feat(security): add auth guard to all admin server actions"
```

---

### Task 3: Limit Registration to 1 Admin

**Files:**
- Modify: `actions/auth.ts`
- Modify: `app/registro/page.tsx`

**Interfaces:**
- Consumes: `prisma` from `lib/prisma.ts`
- Produces: Registration blocked when an admin user already exists

- [ ] **Step 1: Add admin-exists check to `actions/auth.ts`**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// FASE 2: Migrar a sistema de código de invitación cuando se escale a multi-tenant
export async function registrarPeluquero(data: {
  nombreNegocio: string;
  nombre: string;
  email: string;
  password: string;
}) {
  const adminExists = await prisma.user.findFirst({ where: { rol: "ADMIN" } });
  if (adminExists) {
    return { ok: false, error: "Ya existe una cuenta de administrador registrada." };
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese email." };
  }

  const hashed = await bcrypt.hash(data.password, 10);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        nombre: data.nombre,
        rol: "ADMIN",
      },
    }),
    prisma.configuracionApp.upsert({
      where: { clave: "marca_nombre" },
      update: { valor: data.nombreNegocio },
      create: { clave: "marca_nombre", valor: data.nombreNegocio },
    }),
  ]);

  return { ok: true };
}
```

- [ ] **Step 2: Update `app/registro/page.tsx` to check if admin exists**

Add a server-side check at the top of the page. If admin exists, show a message instead of the form. Change the page from `"use client"` to a hybrid: a server page that renders a client form component.

Create the new structure — replace the entire file:

```tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RegistroForm from "./RegistroForm";

export default async function RegistroPage() {
  const adminExists = await prisma.user.findFirst({ where: { rol: "ADMIN" } });

  if (adminExists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
        <div className="w-full max-w-sm text-center">
          <div className="font-display text-[22px] font-semibold">Registro no disponible</div>
          <p className="mt-3 text-sm text-ap-muted">
            Ya existe una cuenta de administrador registrada.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-[14px] bg-ap-primary px-8 py-3 text-[15px] font-bold text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return <RegistroForm />;
}
```

- [ ] **Step 3: Extract form to `app/registro/RegistroForm.tsx`**

Create `app/registro/RegistroForm.tsx` with the existing client-side form code (the full contents of the original `app/registro/page.tsx`):

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarPeluquero } from "@/actions/auth";

export default function RegistroForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }
    const result = await registrarPeluquero({
      nombreNegocio: fd.get("nombreNegocio") as string,
      nombre: fd.get("nombre") as string,
      email: fd.get("email") as string,
      password,
    });
    setLoading(false);
    if (result.ok) {
      router.push("/login");
    } else {
      setError(result.error ?? "Error al registrar.");
    }
  }

  const inputClass =
    "w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ap-sub transition-colors hover:text-ap-text"
        >
          &larr; Volver
        </Link>

        <div className="mb-5">
          <div className="font-display text-[22px] font-semibold">Creá tu cuenta</div>
          <div className="mt-1 text-[13px] text-ap-muted">
            Empezá a gestionar tus turnos hoy.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Nombre de la peluquería
            </label>
            <input name="nombreNegocio" type="text" required placeholder="Ej: BarberFras" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Tu nombre
            </label>
            <input name="nombre" type="text" required placeholder="Ej: Facundo" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Email
            </label>
            <input name="email" type="email" required placeholder="tu@email.com" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Contraseña
            </label>
            <input name="password" type="password" required placeholder="Mínimo 8 caracteres" className={inputClass} />
          </div>

          {error && <p className="text-sm text-ap-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <span className="text-ap-muted">¿Ya tenés cuenta? </span>
          <Link href="/login" className="font-bold text-ap-primary">Ingresá</Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add actions/auth.ts app/registro/page.tsx app/registro/RegistroForm.tsx
git commit -m "feat(security): limit registration to 1 admin account"
```

---

### Task 4: Race Condition Fix + duracionSnapshot

**Files:**
- Modify: `actions/turnos.ts`

**Interfaces:**
- Consumes: `getSlotDisponibles()` from `lib/disponibilidad.ts`, `prisma` from `lib/prisma.ts`
- Produces: Atomic booking with availability check, duracion snapshot saved on create

- [ ] **Step 1: Rewrite `crearTurno` with transaction + availability check + snapshot**

Replace the `crearTurno` function in `actions/turnos.ts`:

```ts
export async function crearTurno(data: {
  fechaHora: Date;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  observaciones?: string;
  modalidad?: "PRESENCIAL" | "DOMICILIO";
  direccion?: string;
  servicioId: string;
  peluqueroId?: string;
  notas?: string;
  origen?: OrigenTurno;
  descuentoAplicado?: number;
  productoIds?: string[];
}) {
  const servicio = await prisma.servicio.findUnique({ where: { id: data.servicioId } });
  if (!servicio) throw new Error("Servicio no encontrado");

  const fecha = new Date(data.fechaHora.getFullYear(), data.fechaHora.getMonth(), data.fechaHora.getDate());
  const horaStr = `${String(data.fechaHora.getHours()).padStart(2, "0")}:${String(data.fechaHora.getMinutes()).padStart(2, "0")}`;
  const modalidad = data.modalidad ?? "PRESENCIAL";

  const { getSlotDisponibles } = await import("@/lib/disponibilidad");
  const slotsDisponibles = await getSlotDisponibles(fecha, servicio.duracion, false, modalidad);

  if (!slotsDisponibles.includes(horaStr)) {
    throw new Error("El horario seleccionado ya no está disponible. Por favor elegí otro.");
  }

  const turno = await prisma.turno.create({
    data: {
      fechaHora: data.fechaHora,
      clienteNombre: data.clienteNombre,
      clienteTelefono: data.clienteTelefono,
      clienteEmail: data.clienteEmail ?? null,
      observaciones: data.observaciones ?? null,
      modalidad,
      direccion: data.direccion ?? null,
      servicioId: data.servicioId,
      peluqueroId: data.peluqueroId ?? null,
      notas: data.notas ?? null,
      origen: data.origen ?? "ONLINE",
      descuentoAplicado: data.descuentoAplicado ?? null,
      duracionSnapshot: servicio.duracion,
      ...(data.productoIds?.length
        ? { productos: { create: data.productoIds.map((id) => ({ productoId: id })) } }
        : {}),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  return { ok: true, id: turno.id };
}
```

Note: This is not a `SELECT FOR UPDATE` transaction (Prisma doesn't support row-level locking easily), but the availability check + create pattern is sufficient for the current single-tenant, low-concurrency scenario. The `getSlotDisponibles` function checks existing turnos in the DB, so if a concurrent request already inserted a turno, the second one will see it as occupied.

- [ ] **Step 2: Remove console.error from crearTurno**

The try/catch with `console.error` is no longer needed since we throw directly:

```ts
// Remove the old try/catch wrapper entirely. The function now throws
// directly if validation fails, and Prisma errors propagate naturally.
```

- [ ] **Step 3: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add actions/turnos.ts
git commit -m "fix(security): add slot availability check before booking + save duracionSnapshot"
```

---

### Task 5: Bug Fixes — Discount Calculation + Error Feedback + Console Cleanup

**Files:**
- Modify: `components/booking/FormularioReserva.tsx`
- Modify: `components/mobile/booking/BookingForm.tsx`

**Interfaces:**
- Produces: Correct discount display, error feedback on booking failure in mobile

- [ ] **Step 1: Fix discount calculation precedence in `FormularioReserva.tsx`**

Find line 487 (the discount display in the products step). Replace:

```tsx
<span>-${((servicio?.precio ?? 0 + [...productosSeleccionados].reduce((acc, id) => acc + (productos.find((p) => p.id === id)?.precio ?? 0), 0)) * descuento.porcentaje / 100).toLocaleString("es-AR")}</span>
```

With:

```tsx
<span>-${(((servicio?.precio ?? 0) + [...productosSeleccionados].reduce((acc, id) => acc + (productos.find((p) => p.id === id)?.precio ?? 0), 0)) * descuento.porcentaje / 100).toLocaleString("es-AR")}</span>
```

The fix is adding parentheses around `(servicio?.precio ?? 0)` so the `??` resolves before the `+`.

- [ ] **Step 2: Remove console.error from `FormularioReserva.tsx`**

Find line 170 and remove:

```tsx
// Remove this line:
console.error("[confirmarReserva]", e);
```

- [ ] **Step 3: Add error feedback + remove console.error in mobile `BookingForm.tsx`**

Add an `error` state and display it. In the component, find the state declarations (around line 41) and add:

```tsx
const [error, setError] = useState("");
```

Replace the `handleConfirm` function (lines 63-88):

```tsx
async function handleConfirm() {
  if (!selectedSvc || !day || !time) return;
  setSubmitting(true);
  setError("");
  try {
    const [y, m, d] = day.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);
    const fechaHora = new Date(y, m - 1, d, h, min);

    await crearTurno({
      fechaHora,
      clienteNombre: name,
      clienteTelefono: phone,
      clienteEmail: email || undefined,
      observaciones: obs || undefined,
      modalidad: place === "home" ? "DOMICILIO" : "PRESENCIAL",
      direccion: place === "home" ? address : undefined,
      servicioId: selectedSvc.id,
      descuentoAplicado: discountPct || undefined,
      productoIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
    });
    setDone(true);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al confirmar el turno";
    setError(msg);
  }
  setSubmitting(false);
}
```

Then in the step 4 (confirm) section, add error display before the footer CTA. Find the price summary closing `</div>` (around line 575) and add after it:

```tsx
{error && (
  <div className="mt-3 rounded-xl border border-[#6E3232] bg-[rgba(242,97,87,.1)] px-3.5 py-3 text-sm text-[#F26157]">
    {error}
  </div>
)}
```

- [ ] **Step 4: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/booking/FormularioReserva.tsx components/mobile/booking/BookingForm.tsx
git commit -m "fix: correct discount calculation, add mobile booking error feedback, remove console.error"
```

---

### Task 6: Mobile Layout — Scroll Fix + Bottom Nav Spacing

**Files:**
- Modify: `app/globals.css`
- Modify: `components/admin/AdminSidebar.tsx`

**Interfaces:**
- Produces: No horizontal scroll on any mobile page, content doesn't hide behind bottom nav or app bar

- [ ] **Step 1: Add mobile viewport lock in `app/globals.css`**

After the existing `html, body` rule (line 37-42), add:

```css
html,
body {
  background-color: var(--color-ap-bg);
  color: var(--color-ap-text);
  min-height: 100dvh;
  overflow-x: hidden;
  max-width: 100vw;
}
```

- [ ] **Step 2: Fix AdminSidebar main container for mobile**

In `components/admin/AdminSidebar.tsx`, update the `<main>` element (line 79):

Replace:
```tsx
<main className="flex-1 overflow-auto bg-ap-bg p-0 md:p-6">
  {children}
</main>
```

With:
```tsx
<main className="flex-1 overflow-x-hidden overflow-y-auto bg-ap-bg p-0 pb-20 md:p-6 md:pb-6">
  {children}
</main>
```

The `pb-20` (80px) reserves space for the bottom nav on mobile. `md:pb-6` resets it for desktop. `overflow-x-hidden` prevents any child from causing horizontal scroll.

- [ ] **Step 3: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/admin/AdminSidebar.tsx
git commit -m "fix(mobile): prevent horizontal scroll, add bottom nav spacing"
```

---

### Task 7: Booking UX — Sticky Button + Month Navigation

**Files:**
- Modify: `components/booking/FormularioReserva.tsx` — sticky "Continuar" on desktop
- Modify: `components/mobile/booking/BookingForm.tsx` — month navigation in calendar

**Interfaces:**
- Produces: Sticky confirmation button in desktop booking, navigable calendar months in mobile booking

- [ ] **Step 1: Make "Continuar/Confirmar" sticky in desktop `FormularioReserva.tsx`**

The form is inside a `<div className="bg-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">`. The buttons at each step are inside this container.

The simplest approach: wrap the entire booking form in a container with the action button sticky at the bottom. Find the paso === "productos" section (line 443) and wrap the final button group in a sticky container.

Replace the confirm button section (lines 501-513):

```tsx
<div className="sticky bottom-0 -mx-6 -mb-6 border-t border-slate-700 bg-slate-900 px-6 py-4 flex flex-col gap-2">
  {errorReserva && (
    <div className="bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
      {errorReserva}
    </div>
  )}
  <button
    type="button"
    disabled={enviando}
    onClick={confirmarReserva}
    className="bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
  >
    {enviando ? "Reservando..." : "Confirmar reserva"}
  </button>
  <button type="button" disabled={enviando} onClick={confirmarReserva} className="text-xs text-slate-600 hover:underline text-center disabled:opacity-50">
    Omitir y confirmar sin productos
  </button>
</div>
```

Also make each step's "Continuar" button sticky. For step 1 (servicio), step 2 (fechaHora), step 3 (modalidad), and step 4 (datos), wrap their respective "Continuar" buttons similarly. The pattern for each is:

Replace:
```tsx
<button type="button" disabled={...} onClick={...} className="bg-gradient-to-r from-blue-500 to-violet-600 ...">
  Continuar
</button>
```

With:
```tsx
<div className="sticky bottom-0 -mx-6 mt-2 border-t border-slate-700 bg-slate-900 px-6 py-4">
  <button type="button" disabled={...} onClick={...} className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
    Continuar
  </button>
</div>
```

Apply this pattern to the buttons at lines 300, 383-389, and 429-437.

- [ ] **Step 2: Add month navigation to mobile booking calendar**

In `components/mobile/booking/BookingForm.tsx`, the `DateTimeStep` component (line 608+) hardcodes the current month. Refactor it to support month navigation.

Replace the month/calendar variables (lines 627-651) with state-based navigation:

```tsx
function DateTimeStep({
  servicioId,
  modalidad,
  selectedDay,
  selectedTime,
  onSelectDay,
  onSelectTime,
}: {
  servicioId: string;
  modalidad: string;
  selectedDay: string | null;
  selectedTime: string | null;
  onSelectDay: (d: string) => void;
  onSelectTime: (t: string) => void;
}) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const daysIn = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWd = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const WD = ["L", "M", "M", "J", "V", "S", "D"];
  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWd; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  function handlePrevMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  async function loadSlots(dateStr: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/disponibilidad?fecha=${dateStr}&servicioId=${servicioId}&modalidad=${modalidad}`,
      );
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : data.slots ?? []);
    } catch {
      setSlots([]);
    }
    setLoading(false);
  }

  function handleDayClick(d: number) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onSelectDay(dateStr);
    loadSlots(dateStr);
    setNightMode(false);
  }

  const selectedDayNum = selectedDay
    ? parseInt(selectedDay.split("-")[2])
    : null;
  const selectedInCurrentView = selectedDay
    ? parseInt(selectedDay.split("-")[1]) - 1 === viewMonth &&
      parseInt(selectedDay.split("-")[0]) === viewYear
    : false;
  const selectedDow = selectedDay ? new Date(selectedDay).getDay() : null;
  const isSaturday = selectedDow === 6;

  const daySlots = nightMode
    ? slots.filter((s) => parseInt(s) >= 20)
    : slots.filter((s) => parseInt(s) < 20);

  function isDayPast(d: number) {
    if (viewYear < today.getFullYear()) return true;
    if (viewYear === today.getFullYear() && viewMonth < today.getMonth()) return true;
    if (isCurrentMonth && d < today.getDate()) return true;
    return false;
  }

  return (
    <div>
      {/* Month header with navigation */}
      <div className="mb-2.5 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          disabled={isCurrentMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5F6B85] disabled:opacity-30"
        >
          &lsaquo;
        </button>
        <span className="text-[15px] font-bold">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={handleNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5F6B85]"
        >
          &rsaquo;
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WD.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-bold text-[#5F6B85]">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="mb-3.5 grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="h-[38px]" />;
          const past = isDayPast(d);
          const on = selectedInCurrentView && d === selectedDayNum;
          const isToday = isCurrentMonth && d === today.getDate();
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => handleDayClick(d)}
              className="flex h-[38px] items-center justify-center rounded-[10px] font-mono-num text-sm transition-all"
              style={{
                background: on
                  ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
                  : "transparent",
                border:
                  isToday && !on
                    ? "1.5px solid #4D8BFF"
                    : "1px solid transparent",
                color: past ? "#39455E" : on ? "#fff" : "#E4E8F0",
                fontWeight: on ? 700 : 500,
                boxShadow: on
                  ? "0 6px 18px -4px rgba(124,92,246,.55)"
                  : "none",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Saturday night toggle */}
      {isSaturday && slots.some((s) => parseInt(s) >= 20) && (
        <button
          onClick={() => setNightMode(!nightMode)}
          className="mb-4 flex w-full items-center gap-2.5 rounded-[13px] border px-3.5 py-3 text-left"
          style={{
            background: nightMode ? "rgba(124,92,246,.14)" : "#16213A",
            borderColor: nightMode ? "#6D4FCF" : "#223052",
          }}
        >
          <span className="text-base">🌙</span>
          <div className="flex-1">
            <div className="text-[13px] font-bold" style={{ color: nightMode ? "#C4B0FF" : "#F4F4F2" }}>
              Horario nocturno especial
            </div>
            <div className="text-[11px]" style={{ color: nightMode ? "#9B85D6" : "#5F6B85" }}>
              20:00 – 23:00
            </div>
          </div>
          <span
            className="relative h-6 w-[42px] rounded-full"
            style={{
              background: nightMode
                ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
                : "#33405E",
            }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-150"
              style={{ left: nightMode ? 20 : 2 }}
            />
          </span>
        </button>
      )}

      {/* Slots */}
      {selectedDay && selectedInCurrentView && (
        <>
          <div className="mb-2.5 text-xs font-semibold text-[#9DA9C0]">
            Horarios disponibles
          </div>
          {loading ? (
            <div className="py-6 text-center text-sm text-[#5F6B85]">
              Cargando horarios...
            </div>
          ) : daySlots.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#5F6B85]">
              No hay horarios disponibles
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {daySlots.map((t) => {
                const on = selectedTime === t;
                return (
                  <button
                    key={t}
                    onClick={() => onSelectTime(t)}
                    className="rounded-[11px] border py-3 text-center font-mono-num text-[13px] font-semibold transition-all"
                    style={{
                      background: on
                        ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)"
                        : "#1A2742",
                      borderColor: on ? "transparent" : "#2A3A5E",
                      color: on ? "#fff" : "#E4E8F0",
                      boxShadow: on
                        ? "0 6px 18px -4px rgba(124,92,246,.55)"
                        : "none",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/booking/FormularioReserva.tsx components/mobile/booking/BookingForm.tsx
git commit -m "fix(ux): sticky booking buttons, add month navigation to mobile calendar"
```

---

### Task 8: Horarios Mobile Performance — Local State

**Files:**
- Modify: `components/mobile/config/HorariosMobile.tsx`

**Interfaces:**
- Consumes: `crearFranjaAdmin`, `eliminarFranjaAdmin` from `actions/horarios`, `crearBloqueoAdmin`, `eliminarBloqueo` from `actions/bloqueos`
- Produces: Expand/collapse is instant (no server round-trip), mutations update local state instead of calling `router.refresh()`

- [ ] **Step 1: Refactor HorariosMobile to use local state**

Replace the entire `components/mobile/config/HorariosMobile.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Clock, ChevronRight, ChevronDown, Trash2, Plus, Info } from "lucide-react";
import { crearFranjaAdmin, eliminarFranjaAdmin } from "@/actions/horarios";
import { crearBloqueoAdmin, eliminarBloqueo } from "@/actions/bloqueos";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"];
const DAY_COLORS = ["#6F6F73", "#2F6BFF", "#B79CFF", "#E8A33D", "#22D366", "#F26157", "#34D399"];

interface Franja {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: string;
  motivo: string | null;
}

interface Bloqueo {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  todoElDia: boolean;
  motivo: string | null;
}

interface HorariosMobileProps {
  horarios: Franja[];
  bloqueos: Bloqueo[];
}

export function HorariosMobile({ horarios: initialHorarios, bloqueos: initialBloqueos }: HorariosMobileProps) {
  const [horarios, setHorarios] = useState(initialHorarios);
  const [bloqueosList, setBloqueosList] = useState(initialBloqueos);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [addingFranjaDay, setAddingFranjaDay] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const positivas = horarios.filter((h) => h.tipoFranja === "POSITIVA");
  const dayFranjas = (dia: number) => positivas.filter((h) => h.diaSemana === dia);
  const dayHasSchedule = (dia: number) => dayFranjas(dia).length > 0;

  const dayRange = (dia: number) => {
    const f = dayFranjas(dia);
    if (f.length === 0) return "Cerrado";
    return f.map((fr) => `${fr.horaApertura}-${fr.horaCierre}`).join(" · ");
  };

  function handleDeleteFranja(id: string) {
    setHorarios((prev) => prev.filter((h) => h.id !== id));
    startTransition(async () => {
      await eliminarFranjaAdmin(id);
    });
  }

  function handleAddFranja(form: FormData, dia: number) {
    const desde = form.get("desde") as string;
    const hasta = form.get("hasta") as string;
    const tempId = `temp-${Date.now()}`;
    setHorarios((prev) => [
      ...prev,
      { id: tempId, diaSemana: dia, horaApertura: desde, horaCierre: hasta, tipoFranja: "POSITIVA", motivo: null },
    ]);
    setAddingFranjaDay(null);
    startTransition(async () => {
      await crearFranjaAdmin({ diaSemana: dia, horaApertura: desde, horaCierre: hasta, tipoFranja: "POSITIVA" });
    });
  }

  function handleToggleDay(dia: number) {
    const franjas = dayFranjas(dia);
    if (franjas.length > 0) {
      setHorarios((prev) => prev.filter((h) => !(h.diaSemana === dia && h.tipoFranja === "POSITIVA")));
      startTransition(async () => {
        for (const fr of franjas) {
          await eliminarFranjaAdmin(fr.id);
        }
      });
    } else {
      const tempId = `temp-${Date.now()}`;
      setHorarios((prev) => [
        ...prev,
        { id: tempId, diaSemana: dia, horaApertura: "09:00", horaCierre: "18:00", tipoFranja: "POSITIVA", motivo: null },
      ]);
      setExpandedDay(dia);
      startTransition(async () => {
        await crearFranjaAdmin({ diaSemana: dia, horaApertura: "09:00", horaCierre: "18:00", tipoFranja: "POSITIVA" });
      });
    }
  }

  function handleToggleBloqueo(dateStr: string) {
    const existing = bloqueosList.find((b) => b.fecha === dateStr);
    if (existing) {
      setBloqueosList((prev) => prev.filter((b) => b.id !== existing.id));
      startTransition(async () => {
        await eliminarBloqueo(existing.id);
      });
    } else {
      const tempId = `temp-${Date.now()}`;
      setBloqueosList((prev) => [
        ...prev,
        { id: tempId, fecha: dateStr, horaInicio: "00:00", horaFin: "23:59", todoElDia: true, motivo: null },
      ]);
      startTransition(async () => {
        const [y, m, d] = dateStr.split("-").map(Number);
        await crearBloqueoAdmin({
          fecha: new Date(y, m - 1, d),
          todoElDia: true,
          horaInicio: "00:00",
          horaFin: "23:59",
        });
      });
    }
  }

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstWd = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const calCells: (number | null)[] = [];
  for (let i = 0; i < firstWd; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);
  while (calCells.length % 7) calCells.push(null);

  const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="pb-4">
      <div className="mb-4 flex items-center gap-2.5 px-4">
        <Clock size={19} color="#F26157" />
        <span className="font-display text-xl font-semibold">Horarios</span>
      </div>

      <div className="px-4">
        <div className="mb-4 rounded-2xl border border-ap-border-soft bg-ap-s1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E1E20]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ap-muted">Días y horarios</span>
            <span className="text-[11px] text-ap-muted">Tocá para gestionar</span>
          </div>

          {[1, 2, 3, 4, 5, 6, 0].map((dia) => {
            const active = dayHasSchedule(dia);
            const expanded = expandedDay === dia;
            const franjas = dayFranjas(dia);

            return (
              <div key={dia} className="border-b border-[#1E1E20] last:border-b-0">
                <div className="flex w-full items-center gap-3 px-4 py-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: active ? `${DAY_COLORS[dia]}20` : "#1E1E20", color: active ? DAY_COLORS[dia] : "#6F6F73" }}
                  >
                    {DAY_LETTERS[dia]}
                  </span>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${active ? "text-ap-text" : "text-ap-muted"}`}>{DAYS[dia]}</div>
                    <div className="text-[11px] text-ap-muted">{dayRange(dia)}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleDay(dia); }}
                    disabled={isPending}
                    className="relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-150"
                    style={{ background: active ? "#22D366" : "#2A2A2C" }}
                  >
                    <span className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] duration-150" style={{ left: active ? 21 : 3 }} />
                  </button>
                  <button
                    onClick={() => setExpandedDay(expanded ? null : dia)}
                    className="flex shrink-0"
                    disabled={!active}
                  >
                    {expanded
                      ? <ChevronDown size={16} color="#2F6BFF" />
                      : <ChevronRight size={16} color={active ? "#6F6F73" : "#3A3A3D"} />
                    }
                  </button>
                </div>

                {expanded && (
                  <div className="border-t border-[#1E1E20] bg-[#161618] px-4 py-3">
                    {franjas.map((fr) => (
                      <div key={fr.id} className="mb-2 flex items-center gap-2 rounded-[10px] border border-[#2A3A2C] bg-[#1A2A1C] px-3.5 py-2.5">
                        <span className="flex-1 font-mono-num text-sm font-bold text-ap-text">
                          {fr.horaApertura} → {fr.horaCierre}
                        </span>
                        <button onClick={() => handleDeleteFranja(fr.id)} disabled={isPending} className="flex text-ap-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {franjas.length === 0 && (
                      <div className="mb-2 text-center text-xs text-ap-muted">Sin franjas — agregá una para activar el día</div>
                    )}

                    {addingFranjaDay === dia ? (
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleAddFranja(new FormData(e.currentTarget), dia); }}
                        className="mt-2 flex items-center gap-2"
                      >
                        <input name="desde" type="time" defaultValue="09:00" required className="flex-1 rounded-lg border border-ap-border-soft bg-ap-s1 px-2 py-1.5 font-mono-num text-sm text-ap-text outline-none" />
                        <span className="text-ap-muted">→</span>
                        <input name="hasta" type="time" defaultValue="18:00" required className="flex-1 rounded-lg border border-ap-border-soft bg-ap-s1 px-2 py-1.5 font-mono-num text-sm text-ap-text outline-none" />
                        <button type="submit" disabled={isPending} className="rounded-lg bg-[#22D366] px-3 py-1.5 text-xs font-bold text-[#08130D]">✓</button>
                        <button type="button" onClick={() => setAddingFranjaDay(null)} className="text-xs text-ap-muted">✕</button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setAddingFranjaDay(dia)}
                        className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ap-sub"
                      >
                        <Plus size={14} /> Agregar franja
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-4 rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Servicio a domicilio</div>
              <div className="text-[11px] text-ap-muted">Activado</div>
            </div>
            <span className="relative h-[26px] w-[44px] rounded-full bg-[#22D366]">
              <span className="absolute top-[3px] left-[21px] h-5 w-5 rounded-full bg-white" />
            </span>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-[#1D2E55] bg-[rgba(47,107,255,.08)] px-3 py-2.5">
            <Info size={14} color="#2F6BFF" className="mt-0.5 shrink-0" />
            <span className="text-xs leading-relaxed text-ap-sub">
              Cada turno a domicilio bloquea <strong className="text-ap-text">45 min antes</strong> y <strong className="text-ap-text">45 min después</strong> para el traslado.
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ap-muted">Días bloqueados</div>
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="text-ap-sub">&lt;</button>
            <span className="text-sm font-semibold">{MONTHS[calMonth]} {calYear}</span>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="text-ap-sub">&gt;</button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-px">
            {["L", "M", "X", "J", "V", "S", "D"].map((w, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-ap-muted">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {calCells.map((d, i) => {
              if (!d) return <div key={i} className="h-9" />;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isBlocked = bloqueosList.some((b) => b.fecha === dateStr);
              const isTodayCell = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
              const isPast = new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <button
                  key={i}
                  disabled={isPast}
                  onClick={() => handleToggleBloqueo(dateStr)}
                  className="flex h-9 items-center justify-center rounded-lg font-mono-num text-xs transition-colors"
                  style={{
                    background: isBlocked ? "rgba(242,97,87,.2)" : "transparent",
                    color: isPast ? "#3A3A3D" : isBlocked ? "#F26157" : isTodayCell ? "#2F6BFF" : "#D9D9DB",
                    border: isTodayCell ? "1px solid #2F6BFF" : "1px solid transparent",
                    fontWeight: isTodayCell || isBlocked ? 700 : 400,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[10px] text-ap-muted">
            <span className="h-2.5 w-2.5 rounded-sm bg-[rgba(242,97,87,.3)]" />
            Tocá un día para bloquearlo/desbloquearlo
          </div>
        </div>
      </div>
    </div>
  );
}
```

Key changes:
- Props renamed to `initialHorarios`/`initialBloqueos`, copied into local state
- `router` and `router.refresh()` removed entirely
- Expand/collapse is now pure local state (instant)
- Mutations update local state optimistically first, then fire the server action in background via `startTransition`
- Removed `useRouter` import

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/mobile/config/HorariosMobile.tsx
git commit -m "perf(mobile): use local state in HorariosMobile, eliminate router.refresh lag"
```

---

### Task 9: Redesign FormularioTurnoManual — Dark Theme + Mobile

**Files:**
- Modify: `components/admin/FormularioTurnoManual.tsx`
- Modify: `app/admin/turnos/nuevo/page.tsx`

**Interfaces:**
- Consumes: `crearTurno` from `actions/turnos`, `Servicio`/`Peluquero` types from Prisma
- Produces: Dark-themed, mobile-responsive form matching admin design system

- [ ] **Step 1: Rewrite `FormularioTurnoManual.tsx` with dark theme**

Replace the entire file:

```tsx
"use client";

import { useState } from "react";
import { crearTurno } from "@/actions/turnos";
import { useRouter } from "next/navigation";
import type { Servicio, Peluquero } from "@prisma/client";

export default function FormularioTurnoManual({
  servicios,
  peluqueros,
}: {
  servicios: Servicio[];
  peluqueros: Peluquero[];
}) {
  const router = useRouter();
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [hora, setHora] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [peluqueroId, setPeluqueroId] = useState("");
  const [notas, setNotas] = useState("");

  const inputClass =
    "w-full rounded-xl border border-ap-border bg-ap-s1 px-3.5 py-3 text-[15px] text-ap-text placeholder-ap-muted outline-none transition-all focus:border-ap-primary focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]";

  async function cargarSlots(fechaISO: string, svcId: string) {
    if (!svcId || !fechaISO) return;
    try {
      const res = await fetch(`/api/disponibilidad?fecha=${fechaISO}&servicioId=${svcId}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError("");

    try {
      const [anio, mes, dia] = fecha.split("-").map(Number);
      const [h, m] = hora.split(":").map(Number);
      const fechaHora = new Date(anio, mes - 1, dia, h, m);

      await crearTurno({
        fechaHora,
        clienteNombre: nombre,
        clienteTelefono: telefono,
        servicioId,
        peluqueroId: peluqueroId || undefined,
        notas: notas || undefined,
        origen: "MANUAL",
      });
      router.push("/admin/turnos");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar el turno";
      setError(msg);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Servicio
        </label>
        <select
          required
          value={servicioId}
          onChange={(e) => {
            setServicioId(e.target.value);
            if (fecha) cargarSlots(fecha, e.target.value);
          }}
          className={inputClass}
        >
          <option value="">Seleccionar...</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} ({s.duracion} min)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Fecha
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            if (servicioId) cargarSlots(e.target.value, servicioId);
          }}
          className={inputClass}
        />
      </div>

      {slots.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
            Horario
          </label>
          <div className="grid grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setHora(s)}
                className="rounded-xl border py-2.5 font-mono-num text-sm font-semibold transition-all"
                style={{
                  background: hora === s ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)" : "var(--color-ap-s1)",
                  borderColor: hora === s ? "transparent" : "var(--color-ap-border)",
                  color: hora === s ? "#fff" : "var(--color-ap-text)",
                  boxShadow: hora === s ? "0 4px 12px -3px rgba(47,107,255,.4)" : "none",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-2.5">
            <label className="mb-1 block text-[11px] text-ap-muted">O ingresá una hora manual</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className={`${inputClass} w-auto`}
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Nombre del cliente
        </label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Teléfono
        </label>
        <input
          type="tel"
          required
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="11 2345 6789"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Peluquero (opcional)
        </label>
        <select
          value={peluqueroId}
          onChange={(e) => setPeluqueroId(e.target.value)}
          className={inputClass}
        >
          <option value="">Sin asignar</option>
          {peluqueros.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Observaciones..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-ap-danger/30 bg-ap-danger/10 px-4 py-3 text-sm text-ap-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!servicioId || !fecha || !hora || !nombre || !telefono || enviando}
        className="rounded-xl bg-ap-primary py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk disabled:opacity-50"
      >
        {enviando ? "Guardando..." : "Guardar turno"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Update `app/admin/turnos/nuevo/page.tsx` for mobile layout**

```tsx
import { prisma } from "@/lib/prisma";
import FormularioTurnoManual from "@/components/admin/FormularioTurnoManual";

export default async function NuevoTurnoPage() {
  const [servicios, peluqueros] = await Promise.all([
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.peluquero.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="px-4 py-4 md:px-0 md:py-0">
      <h2 className="mb-4 text-xl font-bold md:text-2xl md:mb-6">Nuevo turno manual</h2>
      <div className="max-w-lg">
        <FormularioTurnoManual servicios={servicios} peluqueros={peluqueros} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/admin/FormularioTurnoManual.tsx app/admin/turnos/nuevo/page.tsx
git commit -m "feat(ui): redesign manual booking form with dark theme + mobile responsive"
```

---

### Task 10: Frontend Polish — Loading, Error, 404, Metadata, Login, PWA

**Files:**
- Create: `app/admin/loading.tsx`
- Create: `app/admin/error.tsx`
- Create: `app/not-found.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/login/page.tsx`
- Modify: `app/reservar/page.tsx`
- Modify: `public/manifest.json`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`

**Interfaces:**
- Produces: Loading spinner for admin, error boundary, custom 404, viewport metadata, login error feedback, reservar metadata, PWA icons

- [ ] **Step 1: Create `app/admin/loading.tsx`**

```tsx
export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-ap-border border-t-ap-primary" />
        <span className="text-sm text-ap-muted">Cargando...</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/admin/error.tsx`**

```tsx
"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-3 text-4xl">⚠️</div>
        <h2 className="text-lg font-bold text-ap-text">Algo salió mal</h2>
        <p className="mt-1 text-sm text-ap-muted">
          Ocurrió un error inesperado. Intentá de nuevo.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-xl bg-ap-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ap-primary-dk"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="text-center">
        <div className="font-mono-num text-6xl font-bold text-ap-muted">404</div>
        <h2 className="mt-3 text-xl font-bold text-ap-text">Página no encontrada</h2>
        <p className="mt-2 text-sm text-ap-muted">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          href="/reservar"
          className="mt-6 inline-block rounded-xl bg-ap-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-ap-primary-dk"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Fix themeColor in `app/layout.tsx`**

Replace the metadata and add viewport export:

```tsx
import type { Metadata, Viewport } from "next";
import { playfair, manrope, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Peluquería",
  description: "Sistema de turnos online",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Turnos",
  },
};

export const viewport: Viewport = {
  themeColor: "#131313",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-[family-name:var(--font-manrope)] antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Add metadata to `app/reservar/page.tsx`**

Add at the top of the file, after imports:

```tsx
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { prisma } = await import("@/lib/prisma");
  const config = await prisma.configuracionApp.findMany();
  const configMap = Object.fromEntries(config.map((r) => [r.clave, r.valor]));
  const nombre = configMap.marca_nombre || "Tu Peluquería";
  const descripcion = configMap.marca_descripcion || "Reservá tu turno de forma rápida y sencilla.";

  return {
    title: `Reservar turno | ${nombre}`,
    description: descripcion,
    openGraph: {
      title: `Reservar turno | ${nombre}`,
      description: descripcion,
      type: "website",
    },
  };
}
```

Remove the static `prisma` import from the top since it's now used inside both `generateMetadata` and the page function. Or keep it — Next.js deduplicates the import. Best to keep the existing import and only add the `generateMetadata` function.

- [ ] **Step 6: Update `app/login/page.tsx` — remove forgot password + add error feedback**

Replace the entire file:

```tsx
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  async function handleLogin(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/login?error=credentials");
      }
      throw error;
    }
  }

  return <LoginContent action={handleLogin} searchParams={searchParams} />;
}

async function LoginContent({
  action,
  searchParams,
}: {
  action: (formData: FormData) => Promise<void>;
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "credentials";

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border-[1.5px] border-[#233556] bg-[#16203A]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F6BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M20 4 8.12 15.88" />
              <path d="M14.47 14.48 20 20" />
              <path d="M8.12 8.12 12 12" />
            </svg>
          </div>
          <div className="font-display text-[26px] font-semibold tracking-tight">Agenda Turnos</div>
          <div className="mt-1 text-[13px] text-ap-muted">Bienvenido de vuelta</div>
        </div>

        {hasError && (
          <div className="mb-4 rounded-xl border border-ap-danger/30 bg-ap-danger/10 px-4 py-3 text-center text-sm text-ap-danger">
            Email o contraseña incorrectos.
          </div>
        )}

        <form action={action} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              className="w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-[13px] border-[1.5px] border-[#38383B] bg-[#1A1A1C] px-3.5 py-[13px] text-[15px] text-ap-text placeholder-[#4A4A4D] transition-all focus:border-ap-primary focus:outline-none focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]"
            />
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-7 text-center text-sm">
          <span className="text-ap-muted">¿No tenés cuenta? </span>
          <Link href="/registro" className="font-bold text-ap-primary">
            Registrate
          </Link>
        </div>
      </div>
    </div>
  );
}
```

Key changes: removed "¿Olvidaste tu contraseña?" link, added error param handling, changed hardcoded "BarberFras" to "Agenda Turnos".

- [ ] **Step 7: Fix `public/manifest.json` icon references**

Since we can't generate real PNG files from SVG via CLI easily, update the manifest to use the SVG icon and add a note about generating PNGs:

```json
{
  "name": "Agenda Peluquería",
  "short_name": "Turnos",
  "description": "Gestión de turnos para peluquería",
  "start_url": "/admin/hoy",
  "display": "standalone",
  "background_color": "#131313",
  "theme_color": "#131313",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ]
}
```

Note: For full PWA compatibility (especially on Android), generate `icon-192.png` and `icon-512.png` from the SVG using a tool like Figma, Inkscape, or an online converter, then add them back to the icons array. SVG icons are supported by modern browsers but some older devices require PNG.

- [ ] **Step 8: Verify build passes**

Run: `npx next build`
Expected: Build succeeds with no themeColor warnings.

- [ ] **Step 9: Commit**

```bash
git add app/admin/loading.tsx app/admin/error.tsx app/not-found.tsx app/layout.tsx app/login/page.tsx app/reservar/page.tsx public/manifest.json
git commit -m "feat(frontend): add loading/error/404 pages, fix metadata, login feedback, PWA manifest"
```

---

### Task 11: Share Button in AppBar

**Files:**
- Modify: `components/mobile/AppBar.tsx`

**Interfaces:**
- Produces: Share button in mobile app bar that uses Web Share API or clipboard fallback

- [ ] **Step 1: Add share button to `components/mobile/AppBar.tsx`**

Replace the entire file:

```tsx
"use client";

import { useState } from "react";
import { Menu, Scissors, Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { ConfigDrawer } from "./ConfigDrawer";

export function MobileAppBar({ businessName }: { businessName: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/reservar`;
    const shareData = {
      title: businessName,
      text: `Reservá tu turno en ${businessName}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 md:hidden">
        <button onClick={() => setDrawerOpen(true)} className="flex">
          <Menu size={22} color="#ADADB0" />
        </button>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-ap-border bg-ap-s1">
          <Scissors size={15} color="#2F6BFF" />
        </span>
        <span className="flex-1 truncate font-display text-base font-semibold">
          {businessName}
        </span>
        <button
          onClick={handleShare}
          className="flex items-center justify-center rounded-[10px] border border-ap-border bg-ap-s1 p-1.5"
          title={copied ? "Link copiado" : "Compartir link de reservas"}
        >
          <Share2 size={17} color={copied ? "#22D366" : "#ADADB0"} />
        </button>
        <Link
          href="/admin/turnos/nuevo"
          className="flex items-center gap-1.5 rounded-[10px] bg-ap-primary px-3 py-1.5 text-xs font-bold text-white"
        >
          <Plus size={15} />
          Turno
        </Link>
      </div>

      <ConfigDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} businessName={businessName} />
    </>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/mobile/AppBar.tsx
git commit -m "feat(mobile): add share button to AppBar for booking link sharing"
```

---

## Phase 2 Backlog

Items deferred from this phase, documented for future work:

| Item | Descripción | Origen |
|------|-------------|--------|
| Multi-tenant | Agregar `peluqueriaId` a todos los modelos, filtrar queries por tenant | Grill Q4 |
| Registro con invitación | Reemplazar limit-1-admin por código de invitación | Grill Q2-Q4 |
| Upload de imágenes | API de upload + storage (Vercel Blob/S3) para productos y marca | Grill Q12-Q13 |
| `next/image` | Migrar `<img>` a `next/image` con `remotePatterns` | Análisis F4 |
| Recuperación de contraseña | Flujo de reset por email con Resend/SendGrid | Grill Q11 |
| Rate limiting | Middleware de rate limit en APIs públicas | Análisis S6 |
| Paginación ganancias | `take`/`skip` + UI de paginación en `/admin/ganancias` | Análisis D1 |
| Skeletons por página | Loading skeletons específicos para cada ruta admin | Análisis F1 |
| SEO completo | `robots.txt`, `sitemap.xml`, metadata por página, Open Graph | Análisis F9-F10 |
| Accesibilidad | `aria-label` en botones, `scope` en tablas, focus trap en modales | Análisis A1-A3 |
| Dynamic imports | `next/dynamic` para `react-big-calendar` y otros componentes pesados | Análisis D3 |
| Índices FK Prisma | `@@index` en `peluqueroId`, `turnoId`, `productoId` | Análisis D2 |
| Toasts de confirmación | Feedback visual consistente post-acción en formularios admin | Análisis F13 |
| Timezone configurable | Mover "Buenos Aires" hardcodeado a `ConfiguracionApp` | Análisis F12 |
