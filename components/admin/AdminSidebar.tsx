"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth-actions";

const NAV_ITEMS = [
  { href: "/admin",               label: "Agenda"        },
  { href: "/admin/hoy",           label: "Hoy"           },
  { href: "/admin/turnos",        label: "Turnos"        },
  { href: "/admin/servicios",     label: "Servicios"     },
  { href: "/admin/peluqueros",    label: "Peluqueros"    },
  { href: "/admin/horarios",      label: "Horarios"      },
  { href: "/admin/catalogo",      label: "Catálogo"      },
  { href: "/admin/ganancias",     label: "Ganancias"     },
  { href: "/admin/configuracion", label: "Configuración" },
] as const;

export default function AdminSidebar({
  email,
  children,
  hasNewTurnos = false,
}: {
  email: string;
  children: React.ReactNode;
  hasNewTurnos?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar (desktop only) ───────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <h1 className="text-lg font-bold text-zinc-100">Peluquería</h1>
            <p className="mt-0.5 text-xs text-zinc-500">{email}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
            const showDot = label === "Turnos" && hasNewTurnos;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between rounded px-3 py-2 text-sm transition-colors duration-150 ${
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                {label}
                {showDot && (
                  <span className="h-2 w-2 rounded-full bg-[#22D366]" aria-label="Nuevos turnos" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-zinc-800 px-3 py-4">
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded px-3 py-2 text-left text-sm text-zinc-500 transition-colors duration-150 hover:text-zinc-100"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-ap-bg p-0 pb-20 md:p-6 md:pb-6">
        {children}
      </main>
    </div>
  );
}
