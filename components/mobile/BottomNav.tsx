"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ClipboardList, CalendarDays, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { markTurnosSeen } from "@/actions/notificaciones";

const NAV_ITEMS = [
  { href: "/admin/hoy",       label: "Hoy",       Icon: CalendarCheck, notifyKey: "hoy" },
  { href: "/admin/turnos",    label: "Turnos",     Icon: ClipboardList, notifyKey: "turnos" },
  { href: "/admin",           label: "Agenda",     Icon: CalendarDays,  notifyKey: null },
  { href: "/admin/ganancias", label: "Ganancias",  Icon: Wallet,        notifyKey: null },
] as const;

export function MobileBottomNav({ hasNewTurnos = false }: { hasNewTurnos?: boolean }) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (hasNewTurnos) setDismissed(false);
  }, [hasNewTurnos]);

  useEffect(() => {
    if ((hasNewTurnos || !dismissed) && (pathname === "/admin/turnos" || pathname === "/admin/hoy")) {
      setDismissed(true);
      markTurnosSeen();
    }
  }, [pathname]);

  const showDot = hasNewTurnos && !dismissed;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#232325] bg-[#161617] md:hidden"
         style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}>
      {NAV_ITEMS.map(({ href, label, Icon, notifyKey }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const color = isActive ? "#2F6BFF" : "#6F6F73";
        const dot = showDot && (notifyKey === "hoy" || notifyKey === "turnos");
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-1 flex-col items-center gap-1 pb-0 pt-3"
          >
            <div className="relative">
              <Icon size={28} color={color} strokeWidth={2} />
              {dot && (
                <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#161617] bg-[#F26157]" />
              )}
            </div>
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
