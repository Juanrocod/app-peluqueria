"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/actions/auth-actions";

const NAV_ITEMS = [
  { href: "/admin",           label: "Agenda"        },
  { href: "/admin/hoy",       label: "Hoy"           },
  { href: "/admin/turnos",    label: "Turnos"        },
  { href: "/admin/servicios", label: "Servicios"     },
  { href: "/admin/peluqueros",label: "Peluqueros"    },
  { href: "/admin/horarios",  label: "Horarios"      },
  { href: "/admin/catalogo",  label: "Catálogo"      },
  { href: "/admin/ganancias", label: "Ganancias"     },
  { href: "/admin/configuracion", label: "Configuración" },
] as const;

export default function AdminSidebar({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="flex min-h-screen">

      {/* ── Mobile top bar ─────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center bg-gray-900 px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="mr-3 rounded p-1 text-gray-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <line x1="2" y1="5"  x2="20" y2="5"  strokeLinecap="round" />
            <line x1="2" y1="11" x2="20" y2="11" strokeLinecap="round" />
            <line x1="2" y1="17" x2="20" y2="17" strokeLinecap="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">Peluquería</span>
      </header>

      {/* ── Backdrop ────────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-gray-900 text-white
          transition-transform duration-200 ease-out
          md:static md:translate-x-0 md:transition-none
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-5">
          <div>
            <h1 className="text-lg font-bold">Peluquería</h1>
            <p className="mt-0.5 text-xs text-gray-400">{email}</p>
          </div>
          {/* Close — mobile only */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="rounded p-1 text-gray-400 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <line x1="2" y1="2" x2="16" y2="16" strokeLinecap="round" />
              <line x1="16" y1="2" x2="2"  y2="16" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded px-3 py-2 text-sm transition ${
                  active
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="border-t border-gray-700 px-3 py-4">
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded px-3 py-2 text-left text-sm text-gray-400 transition hover:text-white"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6 pt-[72px] md:pt-6">
        {children}
      </main>

    </div>
  );
}
