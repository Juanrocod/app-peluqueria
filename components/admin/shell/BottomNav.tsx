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
