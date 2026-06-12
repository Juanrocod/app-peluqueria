"use client";

import { useState } from "react";
import { addMonths, format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type HorarioRow = {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
};

type BloqueoRow = {
  fecha: string;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
};

function dayHasSlots(date: Date, horarios: HorarioRow[], bloqueos: BloqueoRow[]): boolean {
  const diaSemana = date.getDay();
  const iso = format(date, "yyyy-MM-dd");

  const bloqueoDia = bloqueos.find((b) => b.fecha === iso && b.todoElDia);
  if (bloqueoDia) return false;

  return horarios.some(
    (h) => h.tipoFranja === "POSITIVA" && h.diaSemana === diaSemana
  );
}

function PreviewCalendar({
  horarios,
  bloqueos,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const firstDay = startOfMonth(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  const startOffset = (getDay(firstDay) + 6) % 7;
  const today = format(new Date(), "yyyy-MM-dd");

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize text-ap-text">
          {format(viewDate, "MMMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center">
        {["L","M","X","J","V","S","D"].map((d) => (
          <div key={d} className="text-[9px] font-bold uppercase text-ap-muted">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
          const iso  = format(date, "yyyy-MM-dd");
          const past = iso < today;
          const available = !past && dayHasSlots(date, horarios, bloqueos);

          return (
            <div
              key={iso}
              className={`flex h-9 w-full items-center justify-center rounded-lg text-sm ${
                past
                  ? "cursor-not-allowed text-ap-muted/30 line-through"
                  : available
                  ? "bg-emerald-900/30 border border-emerald-700/40 font-semibold text-emerald-400"
                  : "text-ap-muted/50"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-3 text-[11px] text-ap-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-emerald-900/40 border border-emerald-700/40" />
          Disponible para reservar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded bg-ap-s1" />
          Sin disponibilidad
        </span>
      </div>
    </div>
  );
}

export default function ClientPreviewModal({
  horarios,
  bloqueos,
  onClose,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm lg:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-ap-border bg-ap-s1 p-5 shadow-2xl lg:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ap-accent">
              Vista del cliente
            </p>
            <h2 className="mt-0.5 text-base font-bold text-ap-text">
              Así ven tu disponibilidad
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar preview"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-muted transition hover:bg-ap-border hover:text-ap-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <PreviewCalendar horarios={horarios} bloqueos={bloqueos} />
        <p className="mt-3 text-center text-[10px] text-ap-muted">
          Solo lectura — refleja tu configuración actual
        </p>
      </div>
    </div>
  );
}
