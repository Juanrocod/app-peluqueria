"use client";

import { useState, useTransition } from "react";
import { ChevronRight, MapPin, Scissors, Phone, Tag, Check } from "lucide-react";
import { actualizarEstadoTurno } from "@/actions/turnos";

interface TurnoCardProps {
  id: string;
  nombre: string;
  servicio: string;
  duracion: number;
  precio: number;
  hora: string;
  estado: string;
  modalidad: string;
  direccion?: string | null;
  telefono: string;
  observaciones?: string | null;
}

export function TurnoCard(props: TurnoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isDone = props.estado === "COMPLETADO";
  const isHome = props.modalidad === "DOMICILIO";

  function handleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    if (isDone) return;
    startTransition(async () => {
      await actualizarEstadoTurno(props.id, "COMPLETADO");
    });
  }

  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  return (
    <div
      className="mb-2.5 overflow-hidden rounded-[14px] transition-opacity"
      style={{
        background: isDone ? "#181A18" : "#1C1C1E",
        borderTop: `1px solid ${expanded ? "rgba(47,107,255,.27)" : isDone ? "#222" : "#2A2A2C"}`,
        borderRight: `1px solid ${expanded ? "rgba(47,107,255,.27)" : isDone ? "#222" : "#2A2A2C"}`,
        borderBottom: `1px solid ${expanded ? "rgba(47,107,255,.27)" : isDone ? "#222" : "#2A2A2C"}`,
        borderLeft: `3.5px solid ${isDone ? "#2A3A2A" : "#34D399"}`,
        opacity: isDone ? 0.55 : 1,
      }}
    >
      {/* Main row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center gap-2.5 px-3 py-3"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-[14px] font-bold ${isDone ? "text-ap-muted line-through" : "text-ap-text"}`}>
              {props.nombre}
            </span>
            {isHome && (
              <span className="rounded-md bg-[rgba(232,163,61,.14)] px-1.5 py-0.5 text-[11px] font-bold text-ap-warning">
                🏠 domicilio
              </span>
            )}
          </div>
          <div className={`mt-0.5 flex items-center gap-1.5 text-xs ${isDone ? "line-through" : ""}`}>
            <span className="text-ap-sub">{props.servicio}</span>
            <span className="text-ap-muted">·</span>
            <span className={`font-mono-num font-semibold ${isDone ? "text-ap-muted" : "text-[#22D366]"}`}>
              {money(props.precio)}
            </span>
          </div>
        </div>

        <div className={`font-mono-num text-sm font-bold ${isDone ? "text-ap-muted" : "text-ap-text"}`}>
          {props.hora}
        </div>

        <ChevronRight
          size={15}
          color="#6F6F73"
          className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />

        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={isPending}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-transform active:scale-[0.92]"
          style={{
            borderColor: isDone ? "#34D399" : "#3A4A3A",
            background: isDone ? "#34D399" : "transparent",
          }}
        >
          {isDone && <Check size={14} color="#08130D" />}
        </button>
      </div>

      {/* Accordion */}
      {expanded && (
        <div className="flex flex-col gap-2.5 border-t border-[#1E2A1E] bg-[#161E16] px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isHome ? "bg-[rgba(232,163,61,.1)]" : "bg-[rgba(34,211,102,.08)]"}`}>
              <MapPin size={15} color={isHome ? "#E8A33D" : "#34D399"} />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ap-muted">Modalidad</div>
              <div className="mt-0.5 text-[13px] font-semibold text-ap-text">{isHome ? "A domicilio" : "En el local"}</div>
              {isHome && props.direccion && <div className="mt-0.5 text-xs text-ap-warning">{props.direccion}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(47,107,255,.08)]">
              <Scissors size={15} color="#2F6BFF" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ap-muted">Servicio</div>
              <div className="mt-0.5 text-[13px] font-semibold text-ap-text">{props.servicio} · {props.duracion} min</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ap-s1">
              <Phone size={15} color="#ADADB0" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ap-muted">Teléfono</div>
              <div className="mt-0.5 text-[13px] font-semibold text-ap-text">{props.telefono}</div>
            </div>
          </div>
          {props.observaciones && (
            <div className="flex items-start gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(232,163,61,.08)]">
                <Tag size={15} color="#E8A33D" />
              </span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ap-muted">Observaciones</div>
                <div className="mt-0.5 text-[13px] leading-snug text-ap-warning">{props.observaciones}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
