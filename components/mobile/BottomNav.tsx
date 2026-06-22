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
         style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const color = isActive ? "#2F6BFF" : "#6F6F73";
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 pb-0 pt-3"
          >
            <Icon size={28} color={color} strokeWidth={2} />
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
