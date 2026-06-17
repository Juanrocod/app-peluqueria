"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import { FilterChips } from "./FilterChips";
import { TurnoDetailView } from "./TurnoDetailView";

const STATUS_COLOR: Record<string, string> = {
  PENDIENTE: "#E8A33D",
  CONFIRMADO: "#22D366",
  CANCELADO: "#F26157",
  COMPLETADO: "#2F6BFF",
};

interface Turno {
  id: string;
  fechaHora: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string | null;
  observaciones?: string | null;
  modalidad: string;
  direccion?: string | null;
  estado: string;
  servicio: { nombre: string; precio: number; duracion: number };
}

interface TurnosScreenProps {
  turnos: Turno[];
}

export function TurnosScreen({ turnos }: TurnosScreenProps) {
  const [tab, setTab] = useState<"prox" | "hist">("prox");
  const [filter, setFilter] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Detail view
  if (selectedId) {
    const turno = turnos.find((t) => t.id === selectedId);
    if (turno) {
      return <TurnoDetailView turno={turno} onBack={() => setSelectedId(null)} />;
    }
  }

  const filtered = turnos.filter((t) => {
    if (tab === "prox" && t.estado === "COMPLETADO") return false;
    if (tab === "hist" && t.estado !== "COMPLETADO") return false;
    if (filter !== "todos" && t.estado !== filter) return false;
    return true;
  });

  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  return (
    <div className="flex flex-1 flex-col pb-16">
      <div className="px-4 pt-2">
        {/* Title */}
        <div className="mb-1 flex items-center justify-between">
          <div className="font-display text-[26px] font-semibold">Turnos</div>
          <div className="font-mono-num text-xs text-ap-muted">
            {filtered.length} turno{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex gap-0 rounded-[11px] border border-ap-border-soft bg-ap-s1 p-[3px]">
          {(["prox", "hist"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setFilter("todos"); }}
              className="flex-1 rounded-[9px] py-2 text-[13px] font-semibold transition-colors"
              style={{
                background: tab === t ? "#2F6BFF" : "transparent",
                color: tab === t ? "#fff" : "#ADADB0",
              }}
            >
              {t === "prox" ? "Próximos" : "Historial"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <FilterChips
          active={filter}
          onChange={setFilter}
          includeCompleted={tab === "hist"}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-ap-muted">
            No hay turnos con este filtro.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((t) => {
              const sc = STATUS_COLOR[t.estado] ?? "#6F6F73";
              const fecha = new Date(t.fechaHora);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="flex items-center gap-3 rounded-[14px] border border-ap-border-soft bg-ap-s1 px-3.5 py-3 text-left transition-colors hover:bg-[#232325]"
                  style={{ borderLeft: `3.5px solid ${sc}` }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-bold text-ap-text">
                      {t.clienteNombre}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ap-sub">
                      <span>{t.servicio.nombre}</span>
                      <span className="text-ap-muted">&middot;</span>
                      <span className="font-mono-num font-semibold text-[#22D366]">
                        {money(t.servicio.precio)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono-num text-[15px] font-bold text-ap-text">
                      {format(fecha, "HH:mm")}
                    </div>
                    <div className="text-[11px] text-ap-muted">
                      {format(fecha, "EEE d", { locale: es })}
                    </div>
                  </div>
                  <ChevronRight size={16} color="#6F6F73" className="shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
