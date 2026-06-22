"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { FilterChips } from "./FilterChips";
import { TurnoDetailView } from "./TurnoDetailView";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
    const isDone = t.estado === "COMPLETADO" || t.estado === "CANCELADO";
    if (tab === "prox" && isDone) return false;
    if (tab === "hist" && !isDone) return false;
    if (filter !== "todos" && t.estado !== filter) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col pb-16">
      <div className="px-4 pt-2">
        {/* Title */}
        <div className="mb-0.5 flex items-end justify-between">
          <div>
            <div className="font-display text-[28px] font-bold">Turnos</div>
            <div className="mt-1.5 font-mono-num text-xs text-ap-muted">
              {filtered.length} turno{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="font-mono-num text-xs capitalize text-ap-muted">
            {format(new Date(), "MMMM yyyy", { locale: es })}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-2.5 mb-3 flex gap-0 rounded-[11px] border border-ap-border-soft bg-ap-s1 p-[3px]">
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
          mode={tab === "hist" ? "historial" : "proximos"}
        />
      </div>

      {/* List */}
      <div data-scroll className="flex-1 overflow-y-auto px-4">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-ap-muted">
            No hay turnos con este filtro.
          </div>
        ) : (
          (() => {
            const money = (n: number) => "$" + n.toLocaleString("es-AR");

            const groups = new Map<string, { label: string; items: Turno[] }>();
            for (const t of filtered) {
              const key = format(new Date(t.fechaHora), "yyyy-MM-dd");
              if (!groups.has(key)) {
                groups.set(key, {
                  label: format(new Date(t.fechaHora), "EEEE d 'de' MMMM", { locale: es }),
                  items: [],
                });
              }
              groups.get(key)!.items.push(t);
            }

            const now = new Date();

            const renderCard = (t: Turno) => {
              const sc = STATUS_COLOR[t.estado] ?? "#6F6F73";
              const fecha = new Date(t.fechaHora);
              const isExpired = fecha < now && (t.estado === "PENDIENTE" || t.estado === "CONFIRMADO");
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="flex items-center gap-3 rounded-[14px] border border-ap-border-soft bg-ap-s1 px-3 py-3 text-left transition-colors hover:bg-[#232325]"
                  style={{
                    borderLeft: `3.5px solid ${isExpired ? "#6F6F73" : sc}`,
                    opacity: isExpired ? 0.55 : 1,
                  }}
                >
                  <Avatar name={t.clienteNombre} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[14px] font-bold ${isExpired ? "text-ap-muted line-through" : "text-ap-text"}`}>{t.clienteNombre}</span>
                      <StatusBadge estado={t.estado} />
                    </div>
                    <div className={`mt-0.5 flex items-center gap-1.5 text-xs text-ap-sub ${isExpired ? "line-through" : ""}`}>
                      <span>{t.servicio.nombre}</span>
                      <span className="text-ap-muted">&middot;</span>
                      <span>{t.servicio.duracion} min</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`font-mono-num text-[15px] font-bold ${isExpired ? "text-ap-muted" : "text-ap-text"}`}>
                      {format(fecha, "HH:mm")}
                    </div>
                    <div className={`font-mono-num text-xs font-semibold ${isExpired ? "text-ap-muted" : "text-[#22D366]"}`}>
                      {money(t.servicio.precio)}
                    </div>
                  </div>
                </button>
              );
            };

            return (
              <div className="flex flex-col gap-1">
                {Array.from(groups.entries()).map(([key, { label, items }], i) => (
                  <div key={key}>
                    <div className={`mb-2 flex items-center gap-2 capitalize ${i > 0 ? "mt-3" : ""}`}>
                      <CalendarDays size={14} color="#6F6F73" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ap-muted">{label}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {items.map(renderCard)}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
