"use client";

import { useRouter } from "next/navigation";
import { X, Settings, Scissors, Users, Box, Clock, ChevronRight } from "lucide-react";

const MENU_ITEMS = [
  { href: "/admin/configuracion", label: "Configuración", sub: "Perfil y negocio",       Icon: Settings, color: "#2F6BFF" },
  { href: "/admin/servicios",     label: "Servicios",     sub: "Precios y duración",     Icon: Scissors, color: "#B79CFF" },
  { href: "/admin/peluqueros",    label: "Peluqueros",    sub: "Equipo de trabajo",       Icon: Users,    color: "#34D399" },
  { href: "/admin/catalogo",      label: "Productos",     sub: "Stock y precios",         Icon: Box,      color: "#E8A33D" },
  { href: "/admin/horarios",      label: "Horarios",      sub: "Días y disponibilidad",   Icon: Clock,    color: "#F26157" },
] as const;

export function ConfigDrawer({ open, onClose, businessName }: { open: boolean; onClose: () => void; businessName: string }) {
  const router = useRouter();

  function handleNav(href: string) {
    onClose();
    router.push(href);
  }

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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1C] px-5 py-4">
          <div>
            <div className="mb-2 flex h-[48px] w-[48px] items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #2F6BFF, #8B5CF6)" }}>
              <Scissors size={22} color="#fff" />
            </div>
            <div className="font-display text-lg font-bold">{businessName}</div>
            <div className="mt-0.5 text-[11px] text-ap-muted">Panel del peluquero</div>
          </div>
          <button onClick={onClose} className="flex self-start rounded p-1 text-ap-muted">
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto">
          {MENU_ITEMS.map(({ href, label, sub, Icon, color }) => (
            <button
              key={href}
              onClick={() => handleNav(href)}
              className="flex w-full items-center gap-3 border-b border-[#161618] px-5 py-3.5 text-left transition-colors hover:bg-ap-s1"
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
              <ChevronRight size={15} color="#6F6F73" />
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
