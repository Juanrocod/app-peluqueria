"use client";

import { X, Settings, Scissors, Box, Clock } from "lucide-react";
import Link from "next/link";

const MENU_ITEMS = [
  { href: "/admin/configuracion", label: "Configuración", sub: "Perfil y negocio",       Icon: Settings, color: "#2F6BFF" },
  { href: "/admin/servicios",     label: "Servicios",     sub: "Precios y duración",     Icon: Scissors, color: "#B79CFF" },
  { href: "/admin/catalogo",      label: "Productos",     sub: "Stock y precios",        Icon: Box,      color: "#E8A33D" },
  { href: "/admin/horarios",      label: "Horarios",      sub: "Días y disponibilidad",  Icon: Clock,    color: "#F26157" },
] as const;

export function ConfigDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
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
