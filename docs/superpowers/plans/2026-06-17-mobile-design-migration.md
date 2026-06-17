# Mobile Design Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate 11 Claude Design mobile screens into the existing Next.js codebase as responsive mobile views, preserving all desktop functionality intact.

**Architecture:** Mobile views are added as parallel components alongside existing desktop components using Tailwind responsive classes (`md:hidden` / `hidden md:block`). A shared design token system (`ap-*` CSS variables) unifies colors across both. Three Google Fonts loaded via `next/font/google`. No database schema changes.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Prisma 6, NextAuth 5, Lucide React, next/font/google (Playfair Display, Manrope, JetBrains Mono), SVG inline charts.

---

## Key Decisions (from grill-me session)

- **Target:** PWA (responsive first, manifest/SW at the end)
- **Desktop:** Kept intact, mobile added alongside with breakpoints
- **Registration:** Peluqueros only, creates User + ConfiguracionApp in transaction
- **Password recovery:** UI complete, email sending mocked
- **CSS variables:** Define `ap-*` with design token values
- **Services:** Single-select with combos (no schema change)
- **Config access (mobile):** Hamburger/gear icon in header opens drawer
- **Business name:** Dynamic from `ConfiguracionApp.marca_nombre`
- **Fonts:** All 3 via `next/font/google`
- **Charts:** SVG inline custom (translated from design HTML)
- **Client palette:** Separate navy theme (`--client-*` vars)
- **Buffer domicilio:** Keep 40min (no backend change)
- **Night toggle:** Saturday only, frontend-only (filters existing slots)
- **Avatars:** Shared `<Avatar>` component (mobile + desktop)
- **Multi-barber mobile:** Not supported, assumes single barber
- **Bottom nav:** Hoy | Turnos | Agenda | Ganancias (Config removed)

## File Structure

### New files to create

```
# Design tokens & fonts
app/fonts.ts                              — next/font/google exports for Playfair, Manrope, JetBrains Mono

# Shared UI components
components/ui/Avatar.tsx                  — Initials avatar with deterministic color
components/ui/ProgressBar.tsx             — Linear gradient progress bar (green→blue)
components/ui/StatChip.tsx                — Stats card (label + mono value)
components/ui/StatusBadge.tsx             — Estado badge with semantic color
components/ui/Toggle.tsx                  — iOS-style toggle switch

# Mobile navigation
components/mobile/BottomNav.tsx           — 4-item bottom nav (Hoy/Turnos/Agenda/Ganancias)
components/mobile/AppBar.tsx              — Top bar with hamburger + logo + actions
components/mobile/ConfigDrawer.tsx        — Fullscreen drawer for Config sections

# Mobile auth screens
components/mobile/auth/LoginScreen.tsx    — Dark login with logo + animations
components/mobile/auth/RegisterScreen.tsx — 4-field registration form
components/mobile/auth/RecoveryScreen.tsx — Email input + confirmation mock
app/login/page.tsx                        — Modified: responsive (light desktop / dark mobile)
app/registro/page.tsx                     — New registration page route

# Mobile Hoy
components/mobile/hoy/HoyScreen.tsx       — Full mobile Hoy view
components/mobile/hoy/TurnoCard.tsx       — Expandable turno card with checkbox
components/mobile/hoy/ProximoBanner.tsx    — "Próximo turno" highlight banner

# Mobile Turnos
components/mobile/turnos/TurnosScreen.tsx     — Tabs + filters + card list
components/mobile/turnos/TurnoDetailView.tsx  — Full detail with avatar + actions
components/mobile/turnos/FilterChips.tsx      — Scrollable estado filter pills

# Mobile Agenda
components/mobile/agenda/AgendaScreen.tsx — Year→Month→Day calendar
components/mobile/agenda/YearView.tsx     — 12-month mini grid
components/mobile/agenda/MonthView.tsx    — Monthly calendar with dot indicators
components/mobile/agenda/DayTimeline.tsx  — Hourly timeline with turno blocks

# Mobile Ganancias
components/mobile/ganancias/GananciasScreen.tsx — Hero + charts + filters
components/mobile/ganancias/SparklineChart.tsx  — SVG sparkline polyline
components/mobile/ganancias/BarChart.tsx        — SVG vertical bar chart
components/mobile/ganancias/ServiceBars.tsx     — SVG bars by service type

# Mobile Config
components/mobile/config/ConfigMenu.tsx       — 4-item menu (Perfil/Servicios/Productos/Horarios)
components/mobile/config/PerfilSection.tsx     — Photo upload + profile data + discount code
components/mobile/config/ServiciosSection.tsx  — Service list with inline edit
components/mobile/config/ProductosSection.tsx  — Product list with inline edit
components/mobile/config/HorariosSection.tsx   — Day toggles + time editor + blocked dates

# Mobile client form (separate palette)
components/mobile/booking/BookingForm.tsx      — 5-step wizard with navy palette
components/mobile/booking/ServiceStep.tsx      — Service selection (single + combos)
components/mobile/booking/DateTimeStep.tsx     — Calendar + slot grid + night toggle
components/mobile/booking/ModalityStep.tsx     — Salon/Home cards
components/mobile/booking/PersonalStep.tsx     — Name, phone, email, obs, discount
components/mobile/booking/ConfirmStep.tsx      — Summary + products + total

# Auth actions
actions/auth.ts                           — register action (User + ConfiguracionApp)

# PWA
public/manifest.json                      — PWA manifest
app/manifest.ts                           — Next.js manifest route (or static)
```

### Existing files to modify

```
app/globals.css                           — Add ap-* CSS custom properties + client-* vars
app/layout.tsx                            — Add font classes to <body>, update bg
app/admin/layout.tsx                      — Wire mobile AppBar + BottomNav alongside existing sidebar
components/admin/shell/BottomNav.tsx       — Update items: replace Config with Ganancias
app/admin/hoy/page.tsx                    — Add mobile HoyScreen with md:hidden
app/admin/turnos/page.tsx                 — Add mobile TurnosScreen with md:hidden
app/admin/page.tsx                        — Add mobile AgendaScreen with md:hidden
app/admin/ganancias/page.tsx              — Add mobile GananciasScreen with md:hidden
app/reservar/page.tsx                     — Add mobile BookingForm with md:hidden
middleware.ts                             — Add /registro to public routes
```

---

## Phase 0: Design Tokens + Fonts

### Task 0.1: Define CSS custom properties (ap-* design tokens)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add ap-* custom properties to globals.css**

Add the `@theme` block with all design token variables mapped to the handoff values:

```css
@import "tailwindcss";

@theme {
  /* ── Admin palette (carbón) ─────────────────────── */
  --color-ap-bg:          #131313;
  --color-ap-s1:          #1C1C1E;
  --color-ap-s2:          #262628;
  --color-ap-s3:          #303033;
  --color-ap-border:      #38383B;
  --color-ap-border-soft: #2A2A2C;
  --color-ap-text:        #F4F4F2;
  --color-ap-sub:         #ADADB0;
  --color-ap-muted:       #6F6F73;
  --color-ap-primary:     #2F6BFF;
  --color-ap-primary-dk:  #2456D6;
  --color-ap-accent:      #16203A;
  --color-ap-success:     #34D399;
  --color-ap-warning:     #E8A33D;
  --color-ap-danger:      #F26157;
  --color-ap-purple:      #B79CFF;

  /* ── Client palette (navy) ──────────────────────── */
  --color-cl-bg:          #0C1322;
  --color-cl-card:        #16213A;
  --color-cl-slot:        #1A2742;
  --color-cl-border:      #2A3A5E;
  --color-cl-brand-from:  #3B6EF5;
  --color-cl-brand-to:    #8B5CF6;

  /* Semantic slot colors (fixed by business rule) */
  --color-slot-open-bg:      #10B98147;
  --color-slot-open-border:  #10B98173;
  --color-slot-block-bg:     #EF444442;
  --color-slot-block-border: #EF444466;
}

html,
body {
  background-color: var(--color-ap-bg);
  color: var(--color-ap-text);
  min-height: 100dvh;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Verify existing components render correctly**

Run: `npm run dev`

Open the admin panel in a browser. All existing components using `ap-*` classes (like `bg-ap-s1`, `text-ap-primary`, `border-ap-border`) should now have correct colors instead of being invisible/broken.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: define ap-* and cl-* design token CSS variables

Maps design handoff palette to Tailwind v4 @theme variables.
Admin palette (carbón) and client palette (navy) separated."
```

### Task 0.2: Load Google Fonts via next/font

**Files:**
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create font configuration file**

Create `app/fonts.ts`:

```ts
import { Playfair_Display, Manrope, JetBrains_Mono } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});
```

- [ ] **Step 2: Wire fonts into root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { playfair, manrope, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Peluquería",
  description: "Sistema de turnos online",
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

- [ ] **Step 3: Add font utility classes to globals.css**

Append to `app/globals.css` after the existing content:

```css
/* Font utilities */
.font-display {
  font-family: var(--font-playfair), serif;
}
.font-mono-num {
  font-family: var(--font-mono), monospace;
}
```

- [ ] **Step 4: Verify fonts load**

Run: `npm run dev`

Open browser DevTools → Network tab. Confirm three font files load. Check that body text renders in Manrope (rounded sans-serif).

- [ ] **Step 5: Commit**

```bash
git add app/fonts.ts app/layout.tsx app/globals.css
git commit -m "feat: load Playfair Display, Manrope, JetBrains Mono via next/font"
```

---

## Phase 1: Shared UI Components

### Task 1.1: Avatar component

**Files:**
- Create: `components/ui/Avatar.tsx`

- [ ] **Step 1: Create the Avatar component**

```tsx
"use client";

const COLORS = ["#2F6BFF", "#8B5CF6", "#E8A33D", "#22D366", "#F26157"];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = COLORS[name.length % COLORS.length];
  const radius = Math.round(size * 0.3);
  const fontSize = Math.round(size * 0.36);

  return (
    <div
      className="flex shrink-0 items-center justify-center font-bold"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontSize,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Avatar.tsx
git commit -m "feat: add Avatar component with deterministic color by name"
```

### Task 1.2: ProgressBar, StatChip, StatusBadge, Toggle

**Files:**
- Create: `components/ui/ProgressBar.tsx`
- Create: `components/ui/StatChip.tsx`
- Create: `components/ui/StatusBadge.tsx`
- Create: `components/ui/Toggle.tsx`

- [ ] **Step 1: Create ProgressBar**

```tsx
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2A1A]">
      <div
        className="h-full rounded-full transition-[width] duration-400 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: "linear-gradient(90deg, #22D366, #2F6BFF)",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create StatChip**

```tsx
export function StatChip({
  label,
  value,
  color = "var(--color-ap-text)",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-[11px] border border-ap-border-soft bg-ap-s1 px-2.5 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ap-muted">
        {label}
      </div>
      <div className="font-mono-num mt-1 text-[13px] font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create StatusBadge**

```tsx
const STATUS_MAP: Record<string, { color: string; bg: string; label: string }> = {
  PENDIENTE:  { color: "#E8A33D", bg: "rgba(232,163,61,.12)",  label: "Pendiente" },
  CONFIRMADO: { color: "#22D366", bg: "rgba(34,211,102,.12)",  label: "Confirmado" },
  CANCELADO:  { color: "#F26157", bg: "rgba(242,97,87,.12)",   label: "Cancelado" },
  COMPLETADO: { color: "#2F6BFF", bg: "rgba(47,107,255,.12)",  label: "Completado" },
};

export function StatusBadge({ estado }: { estado: string }) {
  const s = STATUS_MAP[estado] ?? STATUS_MAP.PENDIENTE;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="h-[7px] w-[7px] rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}
```

- [ ] **Step 4: Create Toggle**

```tsx
"use client";

export function Toggle({
  checked,
  onChange,
  color = "#22D366",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-150"
      style={{ background: checked ? color : "#2A2A2C" }}
    >
      <span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] duration-150"
        style={{ left: checked ? 21 : 3 }}
      />
    </button>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/ProgressBar.tsx components/ui/StatChip.tsx components/ui/StatusBadge.tsx components/ui/Toggle.tsx
git commit -m "feat: add ProgressBar, StatChip, StatusBadge, Toggle UI components"
```

### Task 1.3: Mobile BottomNav

**Files:**
- Create: `components/mobile/BottomNav.tsx`

- [ ] **Step 1: Create mobile BottomNav**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ClipboardList, CalendarDays, Wallet } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/hoy",       label: "Hoy",       Icon: CalendarCheck },
  { href: "/admin/turnos",    label: "Turnos",     Icon: ClipboardList },
  { href: "/admin",           label: "Agenda",     Icon: CalendarDays  },
  { href: "/admin/ganancias", label: "Ganancias",  Icon: Wallet        },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#232325] bg-[#161617] md:hidden"
         style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const color = isActive ? "#2F6BFF" : "#6F6F73";
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 pb-2 pt-2"
          >
            <Icon size={21} color={color} strokeWidth={2} />
            <span
              className="text-[10px]"
              style={{ color, fontWeight: isActive ? 700 : 600 }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/mobile/BottomNav.tsx
git commit -m "feat: add MobileBottomNav (Hoy/Turnos/Agenda/Ganancias)"
```

### Task 1.4: Mobile AppBar

**Files:**
- Create: `components/mobile/AppBar.tsx`

- [ ] **Step 1: Create mobile AppBar**

```tsx
"use client";

import { useState } from "react";
import { Menu, Scissors, Plus } from "lucide-react";
import Link from "next/link";
import { ConfigDrawer } from "./ConfigDrawer";

export function MobileAppBar({ businessName }: { businessName: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <Link
          href="/admin/turnos/nuevo"
          className="flex items-center gap-1.5 rounded-[10px] bg-ap-primary px-3 py-1.5 text-xs font-bold text-white"
        >
          <Plus size={15} />
          Turno
        </Link>
      </div>

      <ConfigDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Create ConfigDrawer placeholder**

Create `components/mobile/ConfigDrawer.tsx`:

```tsx
"use client";

import { X, Settings, Scissors, Box, Clock } from "lucide-react";
import Link from "next/link";

const MENU_ITEMS = [
  { href: "/admin/configuracion", label: "Configuración", sub: "Perfil y negocio", Icon: Settings, color: "#2F6BFF" },
  { href: "/admin/servicios",     label: "Servicios",     sub: "Precios y duración", Icon: Scissors, color: "#B79CFF" },
  { href: "/admin/catalogo",      label: "Productos",     sub: "Stock y precios",    Icon: Box,      color: "#E8A33D" },
  { href: "/admin/horarios",      label: "Horarios",      sub: "Días y disponibilidad", Icon: Clock, color: "#F26157" },
] as const;

export function ConfigDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col bg-ap-bg transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1A1A1C] px-5 py-4">
          <div>
            <div className="font-display text-xl font-bold">BarberFras</div>
            <div className="mt-0.5 text-xs text-ap-muted">Panel del peluquero</div>
          </div>
          <button onClick={onClose} className="flex rounded p-1 text-ap-muted">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {MENU_ITEMS.map(({ href, label, sub, Icon, color }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 border-b border-[#161618] px-5 py-3.5 transition-colors hover:bg-ap-s1"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon size={18} color={color} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{label}</div>
                <div className="text-[11px] text-ap-muted">{sub}</div>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/mobile/AppBar.tsx components/mobile/ConfigDrawer.tsx
git commit -m "feat: add MobileAppBar with ConfigDrawer for mobile navigation"
```

### Task 1.5: Wire mobile nav into admin layout

**Files:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Update admin layout to include mobile nav**

Replace `app/admin/layout.tsx`:

```tsx
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MobileBottomNav } from "@/components/mobile/BottomNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <AdminSidebar email={session?.user?.email ?? ""}>
        {children}
      </AdminSidebar>
      <MobileBottomNav />
    </>
  );
}
```

Note: The existing `AdminSidebar` already hides on mobile via `md:` classes. The `MobileBottomNav` hides on desktop via `md:hidden`. They coexist without conflict. The AppBar will be wired per-page in later tasks where each mobile screen needs it.

- [ ] **Step 2: Verify both navs render correctly**

Run: `npm run dev`

Desktop (≥768px): sidebar visible, bottom nav hidden.
Mobile (<768px): bottom nav visible at bottom, sidebar hidden.

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: wire MobileBottomNav into admin layout alongside desktop sidebar"
```

---

## Phase 2: Auth (Login + Registro + Recovery mock)

### Task 2.1: Registration server action

**Files:**
- Create: `actions/auth.ts`

- [ ] **Step 1: Create register action**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registrarPeluquero(data: {
  nombreNegocio: string;
  nombre: string;
  email: string;
  password: string;
}) {
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

- [ ] **Step 2: Commit**

```bash
git add actions/auth.ts
git commit -m "feat: add registrarPeluquero action (User + ConfiguracionApp in transaction)"
```

### Task 2.2: Login page (responsive dark mobile / existing desktop)

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Rewrite login page with responsive design**

Replace `app/login/page.tsx` with a component that shows the dark mobile design on small screens and preserves a clean desktop login on larger screens. The mobile version includes the scissors logo, Playfair Display title, styled dark inputs, "¿Olvidaste tu contraseña?" link, and "Registrate" link. The desktop version keeps a simple centered card. Both use the same server action for login.

Full implementation: ~150 lines. Key structure:

```tsx
import { signIn } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg">
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border-[1.5px] border-[#233556] bg-[#16203A]">
            {/* Scissors SVG inline */}
          </div>
          <div className="font-display text-[26px] font-semibold">BarberFras</div>
          <div className="mt-1 text-[13px] text-ap-muted">Bienvenido de vuelta</div>
        </div>

        {/* Form */}
        <form action={handleLogin} className="flex flex-col gap-3.5">
          {/* Email input with dark styling */}
          {/* Password input with dark styling */}
          <Link href="#" className="self-end text-[13px] font-semibold text-ap-primary">
            ¿Olvidaste tu contraseña?
          </Link>
          <button type="submit" className="w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk">
            Ingresar
          </button>
        </form>

        <div className="mt-7 text-center text-sm">
          <span className="text-ap-muted">¿No tenés cuenta? </span>
          <Link href="/registro" className="font-bold text-ap-primary">Registrate</Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify login works**

Run: `npm run dev`, navigate to `/login`. Dark themed page should render. Login with existing credentials should redirect to `/admin`.

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: redesign login page with dark mobile theme from design handoff"
```

### Task 2.3: Registration page

**Files:**
- Create: `app/registro/page.tsx`
- Modify: `middleware.ts`

- [ ] **Step 1: Add /registro to middleware public routes**

Replace `middleware.ts`:

```ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/login", "/registro"],
};
```

- [ ] **Step 2: Update auth config to allow registro page**

Modify `lib/auth.config.ts` — add `/registro` check in the `authorized` callback:

```ts
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/login";
      const isRegistroPage = nextUrl.pathname === "/registro";

      if (isAdminRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if ((isLoginPage || isRegistroPage) && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
  },
};
```

- [ ] **Step 3: Create registration page**

Create `app/registro/page.tsx` — client component with 4 fields (nombre peluquería, nombre personal, email, contraseña), "← Volver" back link, calls `registrarPeluquero` action, on success redirects to `/login`. Same dark styling as login. ~120 lines.

Key structure:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrarPeluquero } from "@/actions/auth";

export default function RegistroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await registrarPeluquero({
      nombreNegocio: fd.get("nombreNegocio") as string,
      nombre: fd.get("nombre") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    setLoading(false);
    if (result.ok) router.push("/login");
    else setError(result.error ?? "Error al registrar");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ap-bg">
      <div className="w-full max-w-sm px-6">
        <Link href="/login" className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-ap-sub">
          ← Volver
        </Link>
        <div className="mb-5">
          <div className="font-display text-[22px] font-semibold">Creá tu cuenta</div>
          <div className="text-[13px] text-ap-muted">Empezá a gestionar tus turnos hoy.</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* 4 dark-styled inputs: nombreNegocio, nombre, email, password */}
          {error && <p className="text-sm text-ap-danger">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-[14px] bg-ap-primary py-[15px] text-[15px] font-bold text-white">
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

- [ ] **Step 4: Verify registration flow**

Run: `npm run dev`. Navigate to `/registro`. Fill form, submit. Check DB has new User + ConfiguracionApp entry. Redirect to `/login`. Login with new credentials.

- [ ] **Step 5: Commit**

```bash
git add app/registro/page.tsx middleware.ts lib/auth.config.ts
git commit -m "feat: add registration page with dark theme + middleware route"
```

---

## Phase 3–8: Remaining Screens

> **Note:** Phases 3–8 follow the same pattern as Phase 2. Each phase creates mobile components in `components/mobile/` and wires them into existing pages with `md:hidden` / `hidden md:block` breakpoint guards. The plan below provides the task structure for each phase. Full code for each component will be derived from the design handoff HTML at implementation time.

### Task 3.1: Mobile Hoy screen

**Files:**
- Create: `components/mobile/hoy/HoyScreen.tsx` — main screen with header, stats, progress bar, turno list
- Create: `components/mobile/hoy/TurnoCard.tsx` — expandable card with accordion + checkbox
- Create: `components/mobile/hoy/ProximoBanner.tsx` — "Próximo turno" blue banner
- Modify: `app/admin/hoy/page.tsx` — add `<HoyScreen>` wrapped in `md:hidden`, existing content wrapped in `hidden md:block`

- [ ] **Step 1:** Create `ProximoBanner` component (blue tinted card with clock icon + next turno name/time)
- [ ] **Step 2:** Create `TurnoCard` component (expandable accordion with modalidad/servicio/phone/obs rows, checkbox to mark complete, calls `actualizarEstadoTurno`)
- [ ] **Step 3:** Create `HoyScreen` component (header with Playfair "Hoy" + date + done counter, ProgressBar, 3 StatChips, ProximoBanner, scrollable TurnoCard list)
- [ ] **Step 4:** Modify `app/admin/hoy/page.tsx` — wrap existing `<TodayView>` in `hidden md:block`, add `<HoyScreen>` in `md:hidden` with same data props
- [ ] **Step 5:** Verify on mobile viewport: stats, progress bar, expandable cards, checkbox marks turno as COMPLETADO
- [ ] **Step 6:** Commit

### Task 4.1: Mobile Turnos screen (list)

**Files:**
- Create: `components/mobile/turnos/FilterChips.tsx` — scrollable horizontal chips (Todos/Pendiente/Confirmado/Cancelado)
- Create: `components/mobile/turnos/TurnosScreen.tsx` — tabs (Próximos/Historial) + filters + card list
- Modify: `app/admin/turnos/page.tsx` — add mobile view alongside desktop table

- [ ] **Step 1:** Create `FilterChips` component
- [ ] **Step 2:** Create `TurnosScreen` with tabs, filters, turno card list (borde izquierdo semántico, nombre, servicio, precio, hora, chevron)
- [ ] **Step 3:** Modify page to render both views with breakpoint guards
- [ ] **Step 4:** Verify mobile: tab switching, filter chips, card rendering
- [ ] **Step 5:** Commit

### Task 4.2: Mobile Turno detail view

**Files:**
- Create: `components/mobile/turnos/TurnoDetailView.tsx` — full detail with avatar, status badge, info rows, action buttons

- [ ] **Step 1:** Create `TurnoDetailView` with back button, Avatar, StatusBadge, info rows (servicio, fecha, modalidad, contacto, precio, obs), action buttons per estado
- [ ] **Step 2:** Wire into `TurnosScreen` (tap card → show detail, back button → return to list)
- [ ] **Step 3:** Wire action buttons to `actualizarEstadoTurno` server action
- [ ] **Step 4:** Verify: tap card shows detail, confirm/cancel/complete buttons work
- [ ] **Step 5:** Commit

### Task 5.1: Mobile Agenda — Year + Month views

**Files:**
- Create: `components/mobile/agenda/YearView.tsx` — 12 mini-month grids, tap month to open
- Create: `components/mobile/agenda/MonthView.tsx` — 7-col grid with day numbers + color dots for turnos
- Create: `components/mobile/agenda/AgendaScreen.tsx` — view state manager (year/month/day)
- Modify: `app/admin/page.tsx` — add mobile agenda alongside desktop CalendarioAdmin

- [ ] **Step 1:** Create calendar helpers: `monthCells(y, m)`, `firstWdMon(y, m)`, `daysInMonth(y, m)`
- [ ] **Step 2:** Create `YearView` — 3×4 grid of mini months, today highlighted, tap opens month
- [ ] **Step 3:** Create `MonthView` — nav arrows, weekday headers, 7-col grid, dot indicators from turno data, tap day opens DayTimeline
- [ ] **Step 4:** Create `AgendaScreen` as state container managing view transitions
- [ ] **Step 5:** Modify admin page with breakpoint guards
- [ ] **Step 6:** Verify: year→month→day navigation, dots show for days with turnos
- [ ] **Step 7:** Commit

### Task 5.2: Mobile Agenda — Day timeline

**Files:**
- Create: `components/mobile/agenda/DayTimeline.tsx` — hourly grid 9:00–20:00 with positioned turno blocks

- [ ] **Step 1:** Create `DayTimeline` — week strip at top (7 days, selected highlighted), hourly lines below, turno blocks positioned absolutely by start time and duration, color-coded by service type
- [ ] **Step 2:** Wire into `AgendaScreen` as the day-level view
- [ ] **Step 3:** Verify: blocks render at correct positions, week strip allows jumping between days
- [ ] **Step 4:** Commit

### Task 6.1: Mobile Configuración sections

**Files:**
- Create: `components/mobile/config/ConfigMenu.tsx` — menu with 4 nav items
- Create: `components/mobile/config/PerfilSection.tsx` — photo placeholder, profile rows, discount code generator
- Create: `components/mobile/config/ServiciosSection.tsx` — service list with inline edit + add
- Create: `components/mobile/config/ProductosSection.tsx` — product list with inline edit + add
- Create: `components/mobile/config/HorariosSection.tsx` — day toggles, time franjas, blocked dates calendar

- [ ] **Step 1:** Create `ConfigMenu` — 4 items (Configuración, Servicios, Productos, Horarios) with icons and chevrons
- [ ] **Step 2:** Create `PerfilSection` — photo upload placeholder, data rows (nombre, slogan, teléfono, dirección), discount code generator (using existing actions)
- [ ] **Step 3:** Create `ServiciosSection` — service list with colored left border, tap to expand inline edit (nombre, precio, duración), add button with dashed border, delete button. Uses existing `actions/servicios.ts`
- [ ] **Step 4:** Create `ProductosSection` — product list with venta/compra/stock, ganancia neta calculation, inline edit. Uses existing `actions/catalogo.ts`
- [ ] **Step 5:** Create `HorariosSection` — day toggles (L-D), expandable franjas editor, blocked dates mini-calendar. Uses existing `actions/horarios.ts` and `actions/bloqueos.ts`
- [ ] **Step 6:** Update `ConfigDrawer` to use these sections as sub-screens instead of linking to separate pages
- [ ] **Step 7:** Verify: all CRUD operations work from mobile config
- [ ] **Step 8:** Commit

### Task 7.1: Mobile Ganancias

**Files:**
- Create: `components/mobile/ganancias/SparklineChart.tsx` — SVG polyline with gradient area fill
- Create: `components/mobile/ganancias/BarChart.tsx` — SVG vertical bars with gradient fill
- Create: `components/mobile/ganancias/ServiceBars.tsx` — SVG vertical bars per service, each with own color
- Create: `components/mobile/ganancias/GananciasScreen.tsx` — hero card + period filters + charts + stats
- Modify: `app/admin/ganancias/page.tsx` — add mobile view alongside desktop table

- [ ] **Step 1:** Create `SparklineChart` — translates sparkline SVG from design handoff (polyline + area gradient)
- [ ] **Step 2:** Create `BarChart` — translates monthly/weekly bar chart from design (gradient green→blue bars)
- [ ] **Step 3:** Create `ServiceBars` — translates per-service bar chart (each service its own color)
- [ ] **Step 4:** Create `GananciasScreen` — period chips (Semana/Mes/Año), hero card with gradient bg + total + sparkline + trend badge, 2 stat chips (cortes + ticket promedio), BarChart, ServiceBars
- [ ] **Step 5:** Data: query COMPLETADO turnos grouped by period, calculate totals/counts/averages
- [ ] **Step 6:** Modify page with breakpoint guards
- [ ] **Step 7:** Verify: period switching updates all charts and stats
- [ ] **Step 8:** Commit

### Task 8.1: Mobile Booking Form (client)

**Files:**
- Create: `components/mobile/booking/BookingForm.tsx` — 5-step wizard container with navy palette
- Create: `components/mobile/booking/ServiceStep.tsx` — service cards (single select with combos)
- Create: `components/mobile/booking/DateTimeStep.tsx` — month calendar + 4-col slot grid + Saturday night toggle
- Create: `components/mobile/booking/ModalityStep.tsx` — salon/home cards + address input
- Create: `components/mobile/booking/PersonalStep.tsx` — name, phone, email, obs, discount code
- Create: `components/mobile/booking/ConfirmStep.tsx` — summary + products + total + confirmation screen
- Modify: `app/reservar/page.tsx` — add mobile form alongside existing desktop form

- [ ] **Step 1:** Create `ServiceStep` — service cards with color dot, name, duration, price. Single select. Summary bar at bottom showing selected service
- [ ] **Step 2:** Create `DateTimeStep` — month grid (past days grayed, selected day with brand gradient + glow), 4-column slot grid (busy slots struck through, selected with gradient). Saturday night toggle (shows/hides 20:00+ slots)
- [ ] **Step 3:** Create `ModalityStep` — two cards (🏪 En el local / 🏠 A domicilio), amber warning if home, address input
- [ ] **Step 4:** Create `PersonalStep` — dark navy inputs for name*, phone*, email, obs, discount code with "Aplicar" button
- [ ] **Step 5:** Create `ConfirmStep` — product add-on card, price summary, "Confirmar reserva" CTA. On confirm: show confirmation card with green header, check icon, info rows (✂️📅📍💈), total, "Reservar otro turno" button
- [ ] **Step 6:** Create `BookingForm` — progress bar (5 segments), completed steps collapse to summary rows with "Cambiar" button, active step expanded, sticky CTA footer
- [ ] **Step 7:** Modify `app/reservar/page.tsx` with breakpoint guards
- [ ] **Step 8:** Verify full flow: select service → pick date/time → choose modality → enter data → confirm. Check turno appears in admin
- [ ] **Step 9:** Commit

---

## Phase 9: PWA

### Task 9.1: PWA manifest and metadata

**Files:**
- Create: `public/manifest.json`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create PWA manifest**

Create `public/manifest.json`:

```json
{
  "name": "Agenda Peluquería",
  "short_name": "Turnos",
  "description": "Gestión de turnos para peluquería",
  "start_url": "/admin/hoy",
  "display": "standalone",
  "background_color": "#131313",
  "theme_color": "#131313",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: Add manifest link and theme-color to layout**

Add to `app/layout.tsx` inside `metadata`:

```tsx
export const metadata: Metadata = {
  title: "Agenda Peluquería",
  description: "Sistema de turnos online",
  manifest: "/manifest.json",
  themeColor: "#131313",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Turnos",
  },
};
```

- [ ] **Step 3: Create placeholder icons**

Generate 192×192 and 512×512 PNG icons (scissors on dark background) and place in `public/`.

- [ ] **Step 4: Verify PWA**

Open Chrome DevTools → Application → Manifest. Confirm manifest loads. Test "Add to Home Screen" on mobile.

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/icon-192.png public/icon-512.png app/layout.tsx
git commit -m "feat: add PWA manifest for installable mobile experience"
```

---

## Verification Checklist

After all phases:

- [ ] Desktop admin panel works exactly as before (sidebar nav, all pages)
- [ ] Mobile bottom nav shows 4 items (Hoy/Turnos/Agenda/Ganancias)
- [ ] Mobile config accessible via hamburger → drawer
- [ ] Login/Registro dark themed and functional
- [ ] All mobile screens match design handoff colors and typography
- [ ] Fonts render correctly (Playfair for titles, Manrope for body, JetBrains for numbers)
- [ ] Client booking form uses navy palette, separate from admin
- [ ] PWA installable from mobile browser
- [ ] No Prisma schema changes were made
- [ ] All existing server actions and API routes unchanged
