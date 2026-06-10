"use client";

import { useState, useTransition } from "react";
import { addMonths, format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { crearBloqueoAdmin, eliminarBloqueo } from "@/actions/bloqueos";

type BloqueoRow = {
  id: string;
  fecha: string; // "yyyy-MM-dd"
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string | null;
};

function MiniCalendar({
  selected,
  onSelect,
  blockedDates,
}: {
  selected: string | null;
  onSelect: (iso: string) => void;
  blockedDates: string[];
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const firstDay = startOfMonth(viewDate);
  const daysInMonth = getDaysInMonth(viewDate);
  // Mon-first offset: getDay() returns 0=Sun, so (Sun+6)%7=6, Mon=0, Tue=1...
  const startOffset = (getDay(firstDay) + 6) % 7;
  const today = format(new Date(), "yyyy-MM-dd");

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-ap-border bg-ap-bg p-3">
      {/* Navigation */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setViewDate((d) => addMonths(d, -1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border hover:text-ap-text"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize text-ap-text">
          {format(viewDate, "MMMM yyyy", { locale: es })}
        </p>
        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted hover:bg-ap-border hover:text-ap-text"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {["L","M","X","J","V","S","D"].map((d) => (
          <div key={d} className="text-[9px] font-bold uppercase text-ap-muted">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const iso = format(
            new Date(viewDate.getFullYear(), viewDate.getMonth(), day),
            "yyyy-MM-dd"
          );
          const isPast    = iso < today;
          const isBlocked = blockedDates.includes(iso);
          const isSelected = selected === iso;
          return (
            <button
              key={iso}
              onClick={() => !isPast && onSelect(iso)}
              disabled={isPast}
              aria-label={iso}
              aria-pressed={isSelected}
              className={`h-7 w-full rounded text-xs font-medium transition ${
                isPast
                  ? "cursor-not-allowed text-ap-muted/40"
                  : isSelected
                  ? "bg-ap-primary text-white"
                  : isBlocked
                  ? "bg-slot-block-bg text-red-400 border border-slot-block-border"
                  : "text-ap-text hover:bg-ap-border"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LayerExceptions({ bloqueos }: { bloqueos: BloqueoRow[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [pending, startTransition] = useTransition();

  const blockedDates = bloqueos.map((b) => b.fecha);

  function handleAdd() {
    if (!selectedDate) return;
    const [y, m, d] = selectedDate.split("-").map(Number);
    startTransition(async () => {
      await crearBloqueoAdmin({
        fecha: new Date(y, m - 1, d),
        todoElDia: true,
        horaInicio: "00:00",
        horaFin: "23:59",
        motivo: motivo || undefined,
      });
      setSelectedDate(null);
      setMotivo("");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => { await eliminarBloqueo(id); });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Chips de bloqueos existentes */}
      <div className="flex flex-wrap gap-2">
        {bloqueos.length === 0 && (
          <p className="text-sm italic text-ap-muted">Sin fechas bloqueadas.</p>
        )}
        {bloqueos.map((b) => (
          <span
            key={b.id}
            className="flex items-center gap-1.5 rounded-full border border-ap-border bg-ap-s1 px-3 py-1 text-xs font-medium text-ap-text"
          >
            <span
              className="font-mono"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {b.fecha}
            </span>
            {b.motivo && <span className="text-ap-muted">· {b.motivo}</span>}
            <button
              onClick={() => handleDelete(b.id)}
              disabled={pending}
              aria-label={`Quitar bloqueo ${b.fecha}`}
              className="ml-1 text-ap-muted hover:text-red-400 disabled:opacity-40"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {/* Mini-calendar picker */}
      <MiniCalendar
        selected={selectedDate}
        onSelect={setSelectedDate}
        blockedDates={blockedDates}
      />

      {selectedDate && (
        <div className="rounded-xl border border-ap-primary/40 bg-ap-s1 p-4">
          <p className="mb-2 text-sm font-semibold text-ap-accent">
            Bloquear{" "}
            <span
              className="font-mono"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {selectedDate}
            </span>
          </p>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (opcional): feriado, vacaciones..."
            className="w-full rounded-lg border border-ap-border bg-ap-bg px-3 py-2 text-sm text-ap-text placeholder:text-ap-muted/50 focus:border-ap-primary focus:outline-none"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={pending}
              className="flex-1 rounded-lg bg-amber-700 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-40"
            >
              {pending ? "Guardando..." : "Confirmar bloqueo"}
            </button>
            <button
              onClick={() => setSelectedDate(null)}
              className="rounded-lg border border-ap-border px-4 py-2 text-sm text-ap-sub hover:text-ap-text"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
