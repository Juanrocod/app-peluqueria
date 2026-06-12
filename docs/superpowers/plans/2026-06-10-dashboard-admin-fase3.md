# Dashboard Admin Fase 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseño visual completo del panel de administración a nivel SaaS profesional — dark mode, Violet palette, Geist font, grilla de horarios tap-to-toggle, accordion de 3 capas y vista operativa "Hoy". Cero cambios de backend.

**Architecture:** Nuevos componentes encapsulan el nuevo diseño y se montan sobre las mismas server actions y queries Prisma existentes. El `app/admin/layout.tsx` reemplaza el sidebar desktop-only por un `AdminShell` responsive (bottom nav mobile + sidebar desktop). Cada tab del bottom nav mapea a una ruta existente o nueva.

**Tech Stack:** Next.js 15 App Router · Tailwind CSS v4 (`@theme` tokens) · Geist font (paquete npm `geist`) · Lucide React (iconos SVG) · date-fns (ya instalado) · Prisma (ya instalado, sin cambios)

---

## Convenciones del codebase a respetar

- `diaSemana`: `0`=Domingo, `1`=Lunes … `6`=Sábado (convención JS `getDay()`)
- `ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]` → siempre renderizar L→D
- `NOMBRES_DIA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]` — index coincide con diaSemana
- Server actions existentes a usar (NO modificar): `crearFranjaAdmin`, `eliminarFranjaAdmin`, `toggleFranja`, `crearBloqueoAdmin`, `eliminarBloqueo`
- Tailwind v4: sin `tailwind.config.ts`, tokens en `@theme {}` dentro de `globals.css`
- Sin shadcn/ui — componentes custom con Tailwind

---

## Mapa de archivos

| Acción | Ruta |
|--------|------|
| Modificar | `app/globals.css` |
| Modificar | `app/admin/layout.tsx` |
| Modificar | `app/admin/page.tsx` |
| Modificar | `app/admin/horarios/page.tsx` |
| Crear | `components/admin/shell/BottomNav.tsx` |
| Crear | `components/admin/shell/AdminShell.tsx` |
| Crear | `components/admin/schedule/ScheduleGrid.tsx` |
| Crear | `components/admin/today/TodayView.tsx` |
| Crear | `app/admin/hoy/page.tsx` |
| Crear | `components/admin/config/LayerBaseHours.tsx` |
| Crear | `components/admin/config/LayerRecurring.tsx` |
| Crear | `components/admin/config/LayerExceptions.tsx` |
| Crear | `components/admin/config/ScheduleConfig.tsx` |
| Crear | `components/admin/config/ClientPreviewModal.tsx` |

---

## Task 1: Instalar dependencias + Design Tokens

**Files:**
- Modify: `package.json` (npm install)
- Modify: `app/globals.css`

- [ ] **Step 1.1: Instalar Geist y Lucide React**

```bash
npm install geist lucide-react
```

Resultado esperado: `node_modules/geist` y `node_modules/lucide-react` presentes.

- [ ] **Step 1.2: Agregar @theme tokens al globals.css**

Abrir `app/globals.css` (actualmente contiene solo `@import "tailwindcss";`). Reemplazar su contenido completo:

```css
@import "tailwindcss";

@theme {
  /* Admin palette — dark violet SaaS */
  --color-ap-bg:      #0D0B18;
  --color-ap-s1:      #0F0C1A;
  --color-ap-s2:      #160D2E;
  --color-ap-border:  #2D1B69;
  --color-ap-primary: #7C3AED;
  --color-ap-accent:  #A78BFA;
  --color-ap-cta:     #F97316;
  --color-ap-muted:   #475569;
  --color-ap-text:    #F1F5F9;
  --color-ap-sub:     #94A3B8;

  /* Semantic slot colors (fixed by Regla 6) */
  --color-slot-open-bg:      rgba(16, 185, 129, 0.28);
  --color-slot-open-border:  rgba(16, 185, 129, 0.45);
  --color-slot-block-bg:     rgba(239, 68, 68, 0.26);
  --color-slot-block-border: rgba(239, 68, 68, 0.40);
}
```

- [ ] **Step 1.3: Verificar que el proyecto compila**

```bash
npm run dev
```

Abrí `http://localhost:3000/admin`. Debe verse igual que antes (sin cambios visuales aún). Detener el servidor.

- [ ] **Step 1.4: Commit**

```bash
git add app/globals.css package.json package-lock.json
git commit -m "feat: install geist + lucide-react, add admin design tokens"
```

---

## Task 2: BottomNav — Navegación inferior mobile

**Files:**
- Create: `components/admin/shell/BottomNav.tsx`

- [ ] **Step 2.1: Crear el componente BottomNav**

```tsx
// components/admin/shell/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin",          label: "Agenda",   Icon: CalendarDays  },
  { href: "/admin/hoy",      label: "Hoy",      Icon: ClipboardList },
  { href: "/admin/turnos",   label: "Clientes", Icon: Users         },
  { href: "/admin/horarios", label: "Config",   Icon: Settings      },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 border-t border-ap-border bg-ap-s2 lg:hidden">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-ap-primary"
                  : "text-ap-muted hover:text-ap-sub"
              }`}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2 : 1.5}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-ap-border bg-ap-s2 lg:flex">
        <div className="border-b border-ap-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ap-accent">
            Panel Admin
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ap-border text-ap-text"
                    : "text-ap-sub hover:bg-ap-s1 hover:text-ap-text"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
```

- [ ] **Step 2.2: Commit**

```bash
git add components/admin/shell/BottomNav.tsx
git commit -m "feat: add BottomNav component (mobile + desktop)"
```

---

## Task 3: AdminShell + reemplazar admin layout

**Files:**
- Create: `components/admin/shell/AdminShell.tsx`
- Modify: `app/admin/layout.tsx`

- [ ] **Step 3.1: Crear AdminShell**

```tsx
// components/admin/shell/AdminShell.tsx
import { GeistSans } from "geist/font/sans";
import { BottomNav } from "./BottomNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${GeistSans.className} flex min-h-screen bg-ap-bg text-ap-text`}
    >
      <BottomNav />
      {/* pb-14 = clearance for mobile bottom nav height */}
      <main className="flex flex-1 flex-col overflow-auto pb-14 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3.2: Reemplazar app/admin/layout.tsx**

```tsx
// app/admin/layout.tsx
import { auth, signOut } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check se preserva intacto
  await auth();

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
```

> **Nota:** El `signOut` ya no está en el layout. Si necesitás un botón de logout, existe en el sidebar desktop del BottomNav o lo podés agregar al tab Config. Por ahora se puede acceder a `/login` directamente.

- [ ] **Step 3.3: Verificar en browser**

```bash
npm run dev
```

Abrí `http://localhost:3000/admin`. Debe verse el fondo oscuro `#0D0B18` y el bottom nav en la parte inferior (mobile) o sidebar (desktop > 1024px). El contenido existente va a aparecer con estilos mezclados temporalmente — eso se resuelve en tasks posteriores.

- [ ] **Step 3.4: Commit**

```bash
git add components/admin/shell/AdminShell.tsx app/admin/layout.tsx
git commit -m "feat: AdminShell dark layout with responsive BottomNav"
```

---

## Task 4: ScheduleGrid — Grilla de disponibilidad semanal

**Files:**
- Create: `components/admin/schedule/ScheduleGrid.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 4.1: Crear ScheduleGrid**

```tsx
// components/admin/schedule/ScheduleGrid.tsx
"use client";

import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { Turno, Servicio } from "@prisma/client";

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const NOMBRES_DIA   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const HORAS = Array.from({ length: 13 }, (_, i) => i + 8); // 8h a 20h

type HorarioRow = {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
};

type BloqueoRow = {
  fecha: string; // "yyyy-MM-dd"
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
};

type TurnoSimple = Turno & { servicio: Servicio };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function slotStr(hora: number) {
  return `${pad2(hora)}:00`;
}

// Returns 'open' | 'blocked' | 'closed' for a given day+hour
function getCellState(
  diaSemana: number,
  hora: number,
  diaISO: string,
  horarios: HorarioRow[],
  bloqueos: BloqueoRow[]
): "open" | "blocked" | "closed" {
  const slot = slotStr(hora);
  const slotEnd = slotStr(hora + 1);

  // Capa 3: bloqueo puntual del día
  const bloqueosDia = bloqueos.filter((b) => b.fecha === diaISO);
  for (const b of bloqueosDia) {
    if (b.todoElDia) return "blocked";
    if (slot >= b.horaInicio && slot < b.horaFin) return "blocked";
  }

  // Capa 2: franja NEGATIVA recurrente
  const negativas = horarios.filter(
    (h) => h.diaSemana === diaSemana && h.tipoFranja === "NEGATIVA"
  );
  for (const n of negativas) {
    if (slot >= n.horaApertura && slot < n.horaCierre) return "blocked";
  }

  // Capa 1: franja POSITIVA
  const positivas = horarios.filter(
    (h) => h.diaSemana === diaSemana && h.tipoFranja === "POSITIVA"
  );
  for (const p of positivas) {
    if (slot >= p.horaApertura && slotEnd <= p.horaCierre) return "open";
    // Partial coverage
    if (slot >= p.horaApertura && slot < p.horaCierre) return "open";
  }

  return "closed";
}

const CELL_STYLES = {
  open:    "bg-slot-open-bg border border-slot-open-border",
  blocked: "bg-slot-block-bg border border-slot-block-border",
  closed:  "bg-ap-s1 border border-ap-s1",
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE:  "bg-amber-900/60 border-amber-700/50 text-amber-300",
  CONFIRMADO: "bg-violet-900/60 border-ap-border text-ap-accent",
  COMPLETADO: "bg-slate-800/60 border-slate-700/50 text-slate-400",
};

export default function ScheduleGrid({
  turnos,
  horarios,
  bloqueos,
  semanaDesde,
  hoy,
}: {
  turnos: TurnoSimple[];
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
  semanaDesde: string;
  hoy: string;
}) {
  const [ly, lm, ld] = semanaDesde.split("-").map(Number);
  const lunes = new Date(ly, lm - 1, ld);

  // Build an array of Date objects in ORDEN_SEMANA order
  // lunes = Monday. addDays(lunes, 0)=Mon, +1=Tue, ..., +6=Sun
  // ORDEN_SEMANA = [1,2,3,4,5,6,0] → offsets from lunes: [0,1,2,3,4,5,6]
  const diasOrdenados = ORDEN_SEMANA.map((ds) => {
    const offset = ds === 0 ? 6 : ds - 1;
    return { date: addDays(lunes, offset), diaSemana: ds };
  });

  const prevLunes = format(addDays(lunes, -7), "yyyy-MM-dd");
  const nextLunes = format(addDays(lunes, 7), "yyyy-MM-dd");

  function turnosEnSlot(diaDate: Date, hora: number) {
    return turnos.filter((t) => {
      const f = new Date(t.fechaHora);
      return (
        f.getFullYear() === diaDate.getFullYear() &&
        f.getMonth() === diaDate.getMonth() &&
        f.getDate() === diaDate.getDate() &&
        f.getHours() === hora
      );
    });
  }

  const mesLabel = (() => {
    const ini = format(lunes, "MMM", { locale: es });
    const fin = format(addDays(lunes, 6), "MMM", { locale: es });
    const yr  = format(lunes, "yyyy");
    const lbl = ini === fin ? `${ini} ${yr}` : `${ini} – ${fin} ${yr}`;
    return lbl.charAt(0).toUpperCase() + lbl.slice(1);
  })();

  return (
    <div className="flex h-full flex-col gap-0">
      {/* ── Header de navegación de semana ── */}
      <div className="flex items-center justify-between border-b border-ap-border bg-ap-s2 px-4 py-3">
        <Link
          href={`/admin?semana=${prevLunes}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-sub transition hover:bg-ap-border hover:text-ap-text"
          aria-label="Semana anterior"
        >
          ‹
        </Link>
        <div className="text-center">
          <p className="text-sm font-semibold text-ap-text">{mesLabel}</p>
          <p className="text-xs text-ap-accent">
            {format(lunes, "d", { locale: es })} –{" "}
            {format(addDays(lunes, 6), "d MMM", { locale: es })}
          </p>
        </div>
        <Link
          href={`/admin?semana=${nextLunes}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-sub transition hover:bg-ap-border hover:text-ap-text"
          aria-label="Semana siguiente"
        >
          ›
        </Link>
      </div>

      {/* ── Grilla ── */}
      <div className="flex-1 overflow-auto">
        <div
          className="grid min-w-[360px]"
          style={{ gridTemplateColumns: "36px repeat(7, 1fr)" }}
        >
          {/* Cabecera de días */}
          <div className="sticky top-0 z-10 border-b border-ap-border bg-ap-s2" />
          {diasOrdenados.map(({ date, diaSemana }) => {
            const iso  = format(date, "yyyy-MM-dd");
            const esHoy = iso === hoy;
            return (
              <div
                key={diaSemana}
                className={`sticky top-0 z-10 border-b border-r border-ap-border bg-ap-s2 px-1 py-2 text-center ${
                  esHoy ? "bg-ap-border" : ""
                }`}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-ap-muted">
                  {NOMBRES_DIA[diaSemana]}
                </p>
                <p
                  className={`mt-0.5 text-base font-bold ${
                    esHoy ? "text-ap-accent" : "text-ap-text"
                  }`}
                >
                  {format(date, "d")}
                </p>
              </div>
            );
          })}

          {/* Filas horarias */}
          {HORAS.map((hora) => (
            <>
              <div
                key={`t-${hora}`}
                className="border-b border-r border-ap-border px-1 pt-1.5 text-right text-[9px] text-ap-muted"
              >
                {hora}h
              </div>
              {diasOrdenados.map(({ date, diaSemana }) => {
                const iso   = format(date, "yyyy-MM-dd");
                const state = getCellState(diaSemana, hora, iso, horarios, bloqueos);
                const slotTurnos = turnosEnSlot(date, hora);
                return (
                  <div
                    key={`${diaSemana}-${hora}`}
                    className={`min-h-[44px] border-b border-r border-ap-border p-0.5 ${CELL_STYLES[state]}`}
                  >
                    {slotTurnos.map((t) => (
                      <div
                        key={t.id}
                        className={`mb-0.5 rounded border px-1 py-0.5 text-[9px] leading-tight ${
                          ESTADO_COLORS[t.estado] ?? "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <p className="truncate font-semibold">{t.clienteNombre}</p>
                        <p className="truncate opacity-70">{t.servicio.nombre}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* ── Leyenda ── */}
      <div className="flex gap-4 border-t border-ap-border bg-ap-s2 px-4 py-2 text-[10px] text-ap-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slot-open-bg border border-slot-open-border" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slot-block-bg border border-slot-block-border" />
          Bloqueado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-ap-s1 border border-ap-border" />
          Cerrado
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4.2: Actualizar app/admin/page.tsx**

```tsx
// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import ScheduleGrid from "@/components/admin/schedule/ScheduleGrid";
import { startOfWeek, endOfWeek, format } from "date-fns";
import Link from "next/link";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const params = await searchParams;
  const hoy    = new Date();

  let desde: Date;
  if (params.semana) {
    const [y, m, d] = params.semana.split("-").map(Number);
    desde = new Date(y, m - 1, d);
  } else {
    desde = startOfWeek(hoy, { weekStartsOn: 1 });
  }
  const hasta = endOfWeek(desde, { weekStartsOn: 1 });

  const [turnos, horarios, bloqueos] = await Promise.all([
    prisma.turno.findMany({
      where: {
        fechaHora: { gte: desde, lte: hasta },
        estado: { notIn: ["CANCELADO", "COMPLETADO"] },
      },
      include: { servicio: true },
      orderBy: { fechaHora: "asc" },
    }),
    prisma.horarioAtencion.findMany({
      where: { activo: true },
      orderBy: [{ diaSemana: "asc" }, { horaApertura: "asc" }],
    }),
    prisma.bloqueoHorario.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      orderBy: { fecha: "asc" },
    }),
  ]);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:h-screen">
      {/* Header de página */}
      <div className="flex items-center justify-between border-b border-ap-border px-4 py-3">
        <h1 className="text-base font-semibold text-ap-text">Agenda</h1>
        <Link
          href="/admin/turnos/nuevo"
          className="rounded-lg bg-ap-cta px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          + Nuevo turno
        </Link>
      </div>

      <ScheduleGrid
        turnos={turnos}
        horarios={horarios.map((h) => ({
          diaSemana: h.diaSemana,
          horaApertura: h.horaApertura,
          horaCierre: h.horaCierre,
          tipoFranja: h.tipoFranja,
        }))}
        bloqueos={bloqueos.map((b) => ({
          fecha: format(b.fecha, "yyyy-MM-dd"),
          todoElDia: b.todoElDia,
          horaInicio: b.horaInicio,
          horaFin: b.horaFin,
        }))}
        semanaDesde={format(desde, "yyyy-MM-dd")}
        hoy={format(hoy, "yyyy-MM-dd")}
      />
    </div>
  );
}
```

- [ ] **Step 4.3: Verificar en browser**

```bash
npm run dev
```

Abrí `http://localhost:3000/admin`. Debe verse la grilla con fondo oscuro, celdas verdes donde hay franjas POSITIVAS configuradas, rojas donde hay NEGATIVAS o bloqueos, y oscuras donde el día está cerrado. Los turnos existentes aparecen como chips en sus celdas.

- [ ] **Step 4.4: Commit**

```bash
git add components/admin/schedule/ScheduleGrid.tsx app/admin/page.tsx
git commit -m "feat: ScheduleGrid dark mode with 3-layer availability visualization"
```

---

## Task 5: TodayView — Vista operativa del día

**Files:**
- Create: `components/admin/today/TodayView.tsx`
- Create: `app/admin/hoy/page.tsx`

- [ ] **Step 5.1: Crear TodayView**

```tsx
// components/admin/today/TodayView.tsx
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Turno, Servicio } from "@prisma/client";

type TurnoHoy = Turno & { servicio: Servicio };

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE:  "Pendiente",
  CONFIRMADO: "Confirmado",
  COMPLETADO: "Completado",
  CANCELADO:  "Cancelado",
};

const ESTADO_STYLE: Record<string, { bar: string; badge: string }> = {
  PENDIENTE:  { bar: "bg-amber-500",   badge: "bg-amber-900/50 text-amber-300 border-amber-700/40" },
  CONFIRMADO: { bar: "bg-ap-primary",  badge: "bg-violet-900/50 text-ap-accent border-ap-border" },
  COMPLETADO: { bar: "bg-slate-600",   badge: "bg-slate-800/50 text-slate-400 border-slate-700/40" },
  CANCELADO:  { bar: "bg-red-700",     badge: "bg-red-900/50 text-red-400 border-red-800/40" },
};

export default function TodayView({
  turnos,
  slotsLibres,
  fecha,
}: {
  turnos: TurnoHoy[];
  slotsLibres: number;
  fecha: string;
}) {
  const [y, m, d] = fecha.split("-").map(Number);
  const fechaDate = new Date(y, m - 1, d);

  const confirmados = turnos.filter((t) => t.estado === "CONFIRMADO").length;
  const pendientes  = turnos.filter((t) => t.estado === "PENDIENTE").length;
  const ocupacion   =
    turnos.length + slotsLibres > 0
      ? Math.round((turnos.length / (turnos.length + slotsLibres)) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="border-b border-ap-border bg-ap-s2 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ap-accent">Hoy</p>
        <h1 className="mt-0.5 text-xl font-bold text-ap-text capitalize">
          {format(fechaDate, "EEEE d 'de' MMMM", { locale: es })}
        </h1>
        <p className="mt-0.5 text-sm text-ap-sub">
          {confirmados} confirmados · {pendientes} pendientes · {slotsLibres} libres
        </p>
      </div>

      {/* KPI chips */}
      <div className="flex gap-3 border-b border-ap-border px-4 py-3">
        {[
          { label: "Turnos",    value: turnos.length },
          { label: "Ocupación", value: `${ocupacion}%` },
          { label: "Libres",    value: slotsLibres },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-1 flex-col items-center rounded-xl border border-ap-border bg-ap-s1 py-3"
          >
            <span className="text-xl font-bold text-ap-accent">{value}</span>
            <span className="mt-0.5 text-[10px] text-ap-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Lista de turnos */}
      <div className="flex flex-col gap-2 overflow-auto px-4 py-3">
        {turnos.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-3xl">📅</p>
            <p className="text-sm text-ap-sub">Sin turnos para hoy</p>
          </div>
        )}
        {turnos.map((t) => {
          const styles = ESTADO_STYLE[t.estado] ?? ESTADO_STYLE.PENDIENTE;
          return (
            <div
              key={t.id}
              className="flex items-stretch gap-0 overflow-hidden rounded-xl border border-ap-border bg-ap-s1"
            >
              {/* Borde semántico izquierdo */}
              <div className={`w-1 shrink-0 ${styles.bar}`} />
              <div className="flex flex-1 items-center justify-between px-3 py-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-ap-text">{t.clienteNombre}</p>
                  <p className="text-xs text-ap-sub">{t.servicio.nombre}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="font-mono text-sm font-semibold text-ap-text"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {format(new Date(t.fechaHora), "HH:mm")}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${styles.badge}`}
                  >
                    {ESTADO_LABEL[t.estado]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5.2: Crear app/admin/hoy/page.tsx**

```tsx
// app/admin/hoy/page.tsx
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import TodayView from "@/components/admin/today/TodayView";
import { getSlotDisponibles } from "@/lib/disponibilidad";

export default async function HoyPage() {
  const hoy   = new Date();
  const desde = startOfDay(hoy);
  const hasta = endOfDay(hoy);

  const [turnos, servicios] = await Promise.all([
    prisma.turno.findMany({
      where: {
        fechaHora: { gte: desde, lte: hasta },
        estado: { notIn: ["CANCELADO"] },
      },
      include: { servicio: true },
      orderBy: { fechaHora: "asc" },
    }),
    prisma.servicio.findMany({ where: { activo: true }, take: 1 }),
  ]);

  // Calcular slots libres usando el motor de disponibilidad existente
  const duracion = servicios[0]?.duracion ?? 30;
  const slotsHoy = await getSlotDisponibles(hoy, duracion);
  const slotsLibres = slotsHoy.length;

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-auto lg:h-screen">
      <TodayView
        turnos={turnos}
        slotsLibres={slotsLibres}
        fecha={format(hoy, "yyyy-MM-dd")}
      />
    </div>
  );
}
```

- [ ] **Step 5.3: Verificar en browser**

Abrí `http://localhost:3000/admin/hoy`. Debe verse la vista del día con KPIs y lista de turnos del día actual.

- [ ] **Step 5.4: Commit**

```bash
git add components/admin/today/TodayView.tsx app/admin/hoy/page.tsx
git commit -m "feat: TodayView operational tab with KPIs and turn list"
```

---

## Task 6: LayerBaseHours — Capa 1 del accordion

**Files:**
- Create: `components/admin/config/LayerBaseHours.tsx`

- [ ] **Step 6.1: Crear LayerBaseHours**

```tsx
// components/admin/config/LayerBaseHours.tsx
"use client";

import { useState, useTransition } from "react";
import { crearFranjaAdmin, eliminarFranjaAdmin } from "@/actions/horarios";

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const NOMBRES_DIA  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

// 07:00 a 23:00 en intervalos de 30 min
const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2,"0")}:${m}`;
});

type HorarioRow = {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
};

const inputCls =
  "w-full rounded-lg border border-ap-border bg-ap-bg px-2 py-2 text-sm text-ap-text focus:border-ap-primary focus:outline-none";

export default function LayerBaseHours({ horarios }: { horarios: HorarioRow[] }) {
  const positivas = horarios.filter((h) => h.tipoFranja === "POSITIVA");

  const [form, setForm] = useState({ dia: "1", apertura: "09:00", cierre: "18:00" });
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await crearFranjaAdmin({
        diaSemana: parseInt(form.dia),
        horaApertura: form.apertura,
        horaCierre: form.cierre,
        tipoFranja: "POSITIVA",
      });
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => { await eliminarFranjaAdmin(id); });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Lista actual */}
      <div className="flex flex-col gap-1.5">
        {ORDEN_SEMANA.flatMap((dia) =>
          positivas
            .filter((h) => h.diaSemana === dia)
            .map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg border border-ap-border bg-ap-bg px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-sm font-semibold text-ap-accent">
                    {NOMBRES_DIA[h.diaSemana]}
                  </span>
                  <span
                    className="font-mono text-sm text-emerald-400"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {h.horaApertura} – {h.horaCierre}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(h.id)}
                  disabled={pending}
                  aria-label={`Eliminar horario ${NOMBRES_DIA[h.diaSemana]}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted transition hover:bg-red-900/40 hover:text-red-400 disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            ))
        )}
        {positivas.length === 0 && (
          <p className="py-2 text-sm italic text-ap-muted">Sin horario base configurado.</p>
        )}
      </div>

      {/* Formulario de alta */}
      <div className="rounded-xl border border-ap-border bg-ap-bg p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ap-muted">
          Agregar ventana de atención
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Día</label>
            <select
              value={form.dia}
              onChange={(e) => setForm((p) => ({ ...p, dia: e.target.value }))}
              className={inputCls}
            >
              {ORDEN_SEMANA.map((d) => (
                <option key={d} value={d}>{NOMBRES_DIA[d]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Apertura</label>
            <select
              value={form.apertura}
              onChange={(e) => setForm((p) => ({ ...p, apertura: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Cierre</label>
            <select
              value={form.cierre}
              onChange={(e) => setForm((p) => ({ ...p, cierre: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={pending || form.apertura >= form.cierre}
          className="mt-3 w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
        >
          {pending ? "Guardando..." : "Agregar horario base"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.2: Commit**

```bash
git add components/admin/config/LayerBaseHours.tsx
git commit -m "feat: LayerBaseHours accordion section (Capa 1)"
```

---

## Task 7: LayerRecurring — Capa 2 del accordion

**Files:**
- Create: `components/admin/config/LayerRecurring.tsx`

- [ ] **Step 7.1: Crear LayerRecurring**

```tsx
// components/admin/config/LayerRecurring.tsx
"use client";

import { useState, useTransition } from "react";
import { crearFranjaAdmin, eliminarFranjaAdmin } from "@/actions/horarios";

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const NOMBRES_DIA  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2,"0")}:${m}`;
});

type HorarioRow = {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
  motivo?: string | null;
};

const inputCls =
  "w-full rounded-lg border border-ap-border bg-ap-bg px-2 py-2 text-sm text-ap-text focus:border-ap-primary focus:outline-none";

export default function LayerRecurring({ horarios }: { horarios: HorarioRow[] }) {
  const negativas = horarios.filter((h) => h.tipoFranja === "NEGATIVA");

  const [form, setForm] = useState({ dia: "1", desde: "12:00", hasta: "13:00", motivo: "" });
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await crearFranjaAdmin({
        diaSemana: parseInt(form.dia),
        horaApertura: form.desde,
        horaCierre: form.hasta,
        tipoFranja: "NEGATIVA",
        motivo: form.motivo || undefined,
      });
      setForm((p) => ({ ...p, motivo: "" }));
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => { await eliminarFranjaAdmin(id); });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Lista actual */}
      <div className="flex flex-col gap-1.5">
        {ORDEN_SEMANA.flatMap((dia) =>
          negativas
            .filter((h) => h.diaSemana === dia)
            .map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg border border-ap-border bg-ap-bg px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-sm font-semibold text-ap-accent">
                    {NOMBRES_DIA[h.diaSemana]}
                  </span>
                  <span
                    className="font-mono text-sm text-red-400"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {h.horaApertura} – {h.horaCierre}
                  </span>
                  {h.motivo && (
                    <span className="text-xs text-ap-muted">({h.motivo})</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(h.id)}
                  disabled={pending}
                  aria-label="Eliminar bloque recurrente"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted transition hover:bg-red-900/40 hover:text-red-400 disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            ))
        )}
        {negativas.length === 0 && (
          <p className="py-2 text-sm italic text-ap-muted">Sin bloques recurrentes.</p>
        )}
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-ap-border bg-ap-bg p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ap-muted">
          Agregar bloque recurrente
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Día</label>
            <select
              value={form.dia}
              onChange={(e) => setForm((p) => ({ ...p, dia: e.target.value }))}
              className={inputCls}
            >
              {ORDEN_SEMANA.map((d) => <option key={d} value={d}>{NOMBRES_DIA[d]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Desde</label>
            <select
              value={form.desde}
              onChange={(e) => setForm((p) => ({ ...p, desde: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Hasta</label>
            <select
              value={form.hasta}
              onChange={(e) => setForm((p) => ({ ...p, hasta: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs text-ap-muted">Motivo (opcional)</label>
          <input
            type="text"
            value={form.motivo}
            onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))}
            placeholder="Ej: almuerzo, clase de yoga..."
            className={inputCls + " placeholder:text-ap-muted/50"}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={pending || form.desde >= form.hasta}
          className="mt-3 w-full rounded-lg bg-red-800 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
        >
          {pending ? "Guardando..." : "Agregar bloque recurrente"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7.2: Commit**

```bash
git add components/admin/config/LayerRecurring.tsx
git commit -m "feat: LayerRecurring accordion section (Capa 2)"
```

---

## Task 8: LayerExceptions — Capa 3 del accordion

**Files:**
- Create: `components/admin/config/LayerExceptions.tsx`

- [ ] **Step 8.1: Crear LayerExceptions**

```tsx
// components/admin/config/LayerExceptions.tsx
"use client";

import { useState, useTransition } from "react";
import { addMonths, format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { crearBloqueoAdmin, eliminarBloqueo } from "@/actions/bloqueos";

type BloqueoRow = {
  id: string;
  fecha: string; // "yyyy-MM-dd"
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string | null;
};

// Mini calendar visual — no input de texto libre (Regla 2)
function MiniCalendar({
  selected,
  onSelect,
  blockedDates,
}: {
  selected: string | null;
  onSelect: (iso: string) => void;
  blockedDates: string[];
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const firstDay = startOfMonth(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  // getDay() returns 0=Sun...6=Sat; we want Mon-first offset
  const startOffset = (getDay(firstDay) + 6) % 7;
  const today = format(new Date(), "yyyy-MM-dd");

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-ap-border bg-ap-bg p-3">
      {/* Navigation */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border hover:text-ap-text"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize text-ap-text">
          {format(viewDate, "MMMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border hover:text-ap-text"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {["L","M","X","J","V","S","D"].map((d) => (
          <div key={d} className="text-[9px] font-bold uppercase text-ap-muted">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const iso = format(
            new Date(viewDate.getFullYear(), viewDate.getMonth(), day),
            "yyyy-MM-dd"
          );
          const isPast    = iso < today;
          const isBlocked = blockedDates.includes(iso);
          const isSelected = selected === iso;
          return (
            <button
              key={iso}
              onClick={() => !isPast && onSelect(iso)}
              disabled={isPast}
              aria-label={iso}
              aria-pressed={isSelected}
              className={`h-7 w-full rounded text-xs font-medium transition ${
                isPast
                  ? "cursor-not-allowed text-ap-muted/40"
                  : isSelected
                  ? "bg-ap-primary text-white"
                  : isBlocked
                  ? "bg-slot-block-bg text-red-400 border border-slot-block-border"
                  : "text-ap-text hover:bg-ap-border"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LayerExceptions({ bloqueos }: { bloqueos: BloqueoRow[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [pending, startTransition] = useTransition();

  const blockedDates = bloqueos.map((b) => b.fecha);

  function handleAdd() {
    if (!selectedDate) return;
    const [y, m, d] = selectedDate.split("-").map(Number);
    startTransition(async () => {
      await crearBloqueoAdmin({
        fecha: new Date(y, m - 1, d),
        todoElDia: true,
        horaInicio: "00:00",
        horaFin: "23:59",
        motivo: motivo || undefined,
      });
      setSelectedDate(null);
      setMotivo("");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => { await eliminarBloqueo(id); });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Chips de bloqueos existentes */}
      <div className="flex flex-wrap gap-2">
        {bloqueos.length === 0 && (
          <p className="text-sm italic text-ap-muted">Sin fechas bloqueadas.</p>
        )}
        {bloqueos.map((b) => (
          <span
            key={b.id}
            className="flex items-center gap-1.5 rounded-full border border-ap-border bg-ap-s1 px-3 py-1 text-xs font-medium text-ap-text"
          >
            <span
              className="font-mono"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {b.fecha}
            </span>
            {b.motivo && <span className="text-ap-muted">· {b.motivo}</span>}
            <button
              onClick={() => handleDelete(b.id)}
              disabled={pending}
              aria-label={`Quitar bloqueo ${b.fecha}`}
              className="ml-1 text-ap-muted hover:text-red-400 disabled:opacity-40"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Mini-calendar picker */}
      <MiniCalendar
        selected={selectedDate}
        onSelect={setSelectedDate}
        blockedDates={blockedDates}
      />

      {selectedDate && (
        <div className="rounded-xl border border-ap-primary/40 bg-ap-s1 p-4">
          <p className="mb-2 text-sm font-semibold text-ap-accent">
            Bloquear{" "}
            <span
              className="font-mono"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {selectedDate}
            </span>
          </p>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (opcional): feriado, vacaciones..."
            className="w-full rounded-lg border border-ap-border bg-ap-bg px-3 py-2 text-sm text-ap-text placeholder:text-ap-muted/50 focus:border-ap-primary focus:outline-none"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={pending}
              className="flex-1 rounded-lg bg-amber-700 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-40"
            >
              {pending ? "Guardando..." : "Confirmar bloqueo"}
            </button>
            <button
              onClick={() => setSelectedDate(null)}
              className="rounded-lg border border-ap-border px-4 py-2 text-sm text-ap-sub hover:text-ap-text"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 8.2: Commit**

```bash
git add components/admin/config/LayerExceptions.tsx
git commit -m "feat: LayerExceptions with visual MiniCalendar picker (Capa 3)"
```

---

## Task 9: ScheduleConfig — Accordion wrapper de 3 capas

**Files:**
- Create: `components/admin/config/ScheduleConfig.tsx`

- [ ] **Step 9.1: Crear ScheduleConfig**

```tsx
// components/admin/config/ScheduleConfig.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import LayerBaseHours from "./LayerBaseHours";
import LayerRecurring from "./LayerRecurring";
import LayerExceptions from "./LayerExceptions";

type HorarioRow = {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
  motivo?: string | null;
};

type BloqueoRow = {
  id: string;
  fecha: string;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string | null;
};

type LayerKey = "base" | "recurrentes" | "excepciones";

const LAYERS: {
  key: LayerKey;
  title: string;
  subtitle: string;
  dotColor: string;
}[] = [
  {
    key: "base",
    title: "Horario Base",
    subtitle: "Capa 1 · Franjas de atención por día",
    dotColor: "bg-emerald-500",
  },
  {
    key: "recurrentes",
    title: "Bloques Recurrentes",
    subtitle: "Capa 2 · Descansos, almuerzos y pausas",
    dotColor: "bg-red-500",
  },
  {
    key: "excepciones",
    title: "Fechas Bloqueadas",
    subtitle: "Capa 3 · Feriados y días especiales",
    dotColor: "bg-amber-500",
  },
];

export default function ScheduleConfig({
  horarios,
  bloqueos,
  onPreview,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
  onPreview: () => void;
}) {
  const [open, setOpen] = useState<LayerKey>("base");

  function toggle(key: LayerKey) {
    setOpen((prev) => (prev === key ? ("" as LayerKey) : key));
  }

  return (
    <div className="flex flex-col gap-3">
      {LAYERS.map(({ key, title, subtitle, dotColor }) => (
        <div
          key={key}
          className="overflow-hidden rounded-xl border border-ap-border bg-ap-s1"
        >
          {/* Header del accordion */}
          <button
            onClick={() => toggle(key)}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-ap-s2"
            aria-expanded={open === key}
          >
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
              <div>
                <p className="text-sm font-semibold text-ap-text">{title}</p>
                <p className="text-xs text-ap-muted">{subtitle}</p>
              </div>
            </div>
            {open === key ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-ap-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-ap-muted" />
            )}
          </button>

          {/* Cuerpo colapsable */}
          {open === key && (
            <div className="border-t border-ap-border px-4 pb-4 pt-3">
              {key === "base" && <LayerBaseHours horarios={horarios} />}
              {key === "recurrentes" && <LayerRecurring horarios={horarios} />}
              {key === "excepciones" && <LayerExceptions bloqueos={bloqueos} />}
            </div>
          )}
        </div>
      ))}

      {/* Botón de previsualización */}
      <button
        onClick={onPreview}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-ap-border bg-ap-s1 py-3 text-sm font-medium text-ap-accent transition hover:bg-ap-s2 hover:border-ap-primary"
      >
        <span>👁</span>
        Ver cómo me ven los clientes
      </button>
    </div>
  );
}
```

- [ ] **Step 9.2: Commit**

```bash
git add components/admin/config/ScheduleConfig.tsx
git commit -m "feat: ScheduleConfig accordion with 3 layers + preview button"
```

---

## Task 10: ClientPreviewModal — Previsualización en vivo

**Files:**
- Create: `components/admin/config/ClientPreviewModal.tsx`

- [ ] **Step 10.1: Crear ClientPreviewModal**

```tsx
// components/admin/config/ClientPreviewModal.tsx
"use client";

import { useState } from "react";
import { addMonths, format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type HorarioRow = {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
};

type BloqueoRow = {
  fecha: string;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
};

// Determina si un día tiene al menos 1 slot disponible
function dayHasSlots(date: Date, horarios: HorarioRow[], bloqueos: BloqueoRow[]): boolean {
  const diaSemana = date.getDay();
  const iso = format(date, "yyyy-MM-dd");

  const bloqueoDia = bloqueos.find((b) => b.fecha === iso && b.todoElDia);
  if (bloqueoDia) return false;

  return horarios.some(
    (h) => h.tipoFranja === "POSITIVA" && h.diaSemana === diaSemana
  );
}

function PreviewCalendar({
  horarios,
  bloqueos,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const firstDay = startOfMonth(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  const startOffset = (getDay(firstDay) + 6) % 7;
  const today = format(new Date(), "yyyy-MM-dd");

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize text-ap-text">
          {format(viewDate, "MMMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center">
        {["L","M","X","J","V","S","D"].map((d) => (
          <div key={d} className="text-[9px] font-bold uppercase text-ap-muted">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
          const iso  = format(date, "yyyy-MM-dd");
          const past = iso < today;
          const available = !past && dayHasSlots(date, horarios, bloqueos);

          return (
            <div
              key={iso}
              className={`flex h-9 w-full items-center justify-center rounded-lg text-sm ${
                past
                  ? "cursor-not-allowed text-ap-muted/30 line-through"
                  : available
                  ? "bg-emerald-900/30 border border-emerald-700/40 font-semibold text-emerald-400"
                  : "text-ap-muted/50"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-3 text-[11px] text-ap-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-emerald-900/40 border border-emerald-700/40" />
          Disponible para reservar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-ap-s1" />
          Sin disponibilidad
        </span>
      </div>
    </div>
  );
}

export default function ClientPreviewModal({
  horarios,
  bloqueos,
  onClose,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm lg:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-ap-border bg-ap-s1 p-5 shadow-2xl lg:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ap-accent">
              Vista del cliente
            </p>
            <h2 className="mt-0.5 text-base font-bold text-ap-text">
              Así ven tu disponibilidad
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar preview"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-muted transition hover:bg-ap-border hover:text-ap-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <PreviewCalendar horarios={horarios} bloqueos={bloqueos} />
        <p className="mt-3 text-center text-[10px] text-ap-muted">
          Solo lectura — refleja tu configuración actual
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 10.2: Commit**

```bash
git add components/admin/config/ClientPreviewModal.tsx
git commit -m "feat: ClientPreviewModal live preview of client availability"
```

---

## Task 11: Actualizar Config page — Montar ScheduleConfig

**Files:**
- Modify: `app/admin/horarios/page.tsx`

- [ ] **Step 11.1: Crear wrapper client para manejar el modal**

```tsx
// components/admin/config/ConfigPageClient.tsx
"use client";

import { useState } from "react";
import ScheduleConfig from "./ScheduleConfig";
import ClientPreviewModal from "./ClientPreviewModal";

type HorarioRow = {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
  motivo?: string | null;
};

type BloqueoRow = {
  id: string;
  fecha: string;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string | null;
};

export default function ConfigPageClient({
  horarios,
  bloqueos,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <ScheduleConfig
        horarios={horarios}
        bloqueos={bloqueos}
        onPreview={() => setShowPreview(true)}
      />
      {showPreview && (
        <ClientPreviewModal
          horarios={horarios.map((h) => ({
            diaSemana: h.diaSemana,
            horaApertura: h.horaApertura,
            horaCierre: h.horaCierre,
            tipoFranja: h.tipoFranja,
          }))}
          bloqueos={bloqueos.map((b) => ({
            fecha: b.fecha,
            todoElDia: b.todoElDia,
            horaInicio: b.horaInicio,
            horaFin: b.horaFin,
          }))}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 11.2: Reemplazar app/admin/horarios/page.tsx**

```tsx
// app/admin/horarios/page.tsx
import { prisma } from "@/lib/prisma";
import { format, startOfToday } from "date-fns";
import ConfigPageClient from "@/components/admin/config/ConfigPageClient";

export default async function HorariosPage() {
  const hoy    = startOfToday();
  const hoyUTC = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));

  const [horarios, bloqueos] = await Promise.all([
    prisma.horarioAtencion.findMany({
      where: { activo: true },
      orderBy: [{ diaSemana: "asc" }, { horaApertura: "asc" }],
    }),
    prisma.bloqueoHorario.findMany({
      where: { fecha: { gte: hoyUTC } },
      orderBy: { fecha: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="border-b border-ap-border bg-ap-s2 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ap-accent">
          Config
        </p>
        <h1 className="mt-0.5 text-xl font-bold text-ap-text">Horarios de atención</h1>
        <p className="mt-0.5 text-sm text-ap-sub">
          Configurá tu disponibilidad semanal en 3 capas.
        </p>
      </div>

      {/* Accordion */}
      <div className="overflow-auto px-4 py-4">
        <ConfigPageClient
          horarios={horarios.map((h) => ({
            id: h.id,
            diaSemana: h.diaSemana,
            horaApertura: h.horaApertura,
            horaCierre: h.horaCierre,
            tipoFranja: h.tipoFranja,
            motivo: h.motivo,
          }))}
          bloqueos={bloqueos.map((b) => ({
            id: b.id,
            fecha: format(b.fecha, "yyyy-MM-dd"),
            horaInicio: b.horaInicio,
            horaFin: b.horaFin,
            todoElDia: b.todoElDia,
            motivo: b.motivo,
          }))}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 11.3: Verificar flujo completo en browser**

```bash
npm run dev
```

Verificar:
1. `http://localhost:3000/admin` → Grilla oscura con colores semánticos + turnos
2. `http://localhost:3000/admin/hoy` → Vista del día con KPIs
3. `http://localhost:3000/admin/horarios` → Accordion con 3 capas expandibles
4. Click "Ver cómo me ven los clientes" → Modal de previsualización se abre
5. Agregar un horario base → Aparece en la lista sin recargar la página
6. Agregar un bloque recurrente → Aparece en lista
7. Seleccionar fecha en MiniCalendar → Fecha se resalta, form de confirmación aparece
8. Abrir en mobile (375px) → Bottom nav visible en la parte inferior, contenido sin overlap

- [ ] **Step 11.4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores.

- [ ] **Step 11.5: Commit final**

```bash
git add components/admin/config/ConfigPageClient.tsx app/admin/horarios/page.tsx
git commit -m "feat: wire ScheduleConfig + ClientPreviewModal into Config page"
```

---

## Self-Review

**Cobertura del spec:**
- ✅ Sistema de diseño (tokens @theme, Geist, Lucide)
- ✅ Bottom Nav mobile + sidebar desktop (Task 2–3)
- ✅ ScheduleGrid con 3 capas de disponibilidad (Task 4)
- ✅ TodayView con KPIs + lista cronológica (Task 5)
- ✅ Capa 1 accordion (Task 6)
- ✅ Capa 2 accordion (Task 7)
- ✅ Capa 3 con MiniCalendar visual (Task 8)
- ✅ ScheduleConfig wrapper (Task 9)
- ✅ ClientPreviewModal (Task 10)
- ✅ Cero cambios de backend — se usan server actions y queries existentes

**Sin input de texto libre para fechas/horas:**
- Todas las selecciones de hora usan `<select>` con TIME_OPTIONS ✅
- Selección de fecha usa MiniCalendar visual ✅
- Regla 2 cumplida ✅

**Consistencia de tipos:**
- `HorarioRow` y `BloqueoRow` se definen localmente en cada componente con la misma forma
- Todos los `diaSemana` usan convención 0=Dom, 1=Lun como el codebase existente ✅
- `format(b.fecha, "yyyy-MM-dd")` en los pages para serializar fechas de Prisma ✅
