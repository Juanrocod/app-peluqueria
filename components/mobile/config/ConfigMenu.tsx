"use client";

import { Settings, Scissors, Box, Clock, ChevronRight } from "lucide-react";

const ITEMS = [
  { key: "config",    label: "Configuración", sub: "Perfil y negocio",       Icon: Settings, color: "#2F6BFF" },
  { key: "servicios", label: "Servicios",     sub: "Precios y duración",     Icon: Scissors, color: "#B79CFF" },
  { key: "productos", label: "Productos",     sub: "Stock y precios",        Icon: Box,      color: "#E8A33D" },
  { key: "horarios",  label: "Horarios",      sub: "Días y disponibilidad",  Icon: Clock,    color: "#F26157" },
] as const;

interface ConfigMenuProps {
  businessName: string;
  onSelect: (key: string) => void;
}

export function ConfigMenu({ businessName, onSelect }: ConfigMenuProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-[#1A1A1C] px-4 py-4">
        <div className="mb-2.5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #2F6BFF, #8B5CF6)" }}>
          <Scissors size={26} color="#fff" />
        </div>
        <div className="font-display text-xl font-bold">{businessName}</div>
        <div className="mt-0.5 text-xs text-ap-muted">Panel del peluquero</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {ITEMS.map(({ key, label, sub, Icon, color }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="flex w-full items-center gap-3 border-b border-[#161618] px-4 py-3.5 text-left transition-colors hover:bg-ap-s1"
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
      </div>
    </div>
  );
}
