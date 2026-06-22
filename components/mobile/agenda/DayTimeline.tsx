"use client";

import { ChevronLeft } from "lucide-react";

const MONTHS_ABBR = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const WD_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

const SVC_STYLES: Record<string, { c: string; bg: string }> = {
  "Coloración":          { c: "#7FA9FF", bg: "#141E33" },
  "Corte":               { c: "#34D399", bg: "#10231B" },
  "Corte de pelo":       { c: "#34D399", bg: "#10231B" },
  "Corte + barba":       { c: "#34D399", bg: "#10231B" },
  "Peinado":             { c: "#E8A33D", bg: "#241B0E" },
  "Tratamiento":         { c: "#B79CFF", bg: "#1E1830" },
  "Tratamiento capilar": { c: "#B79CFF", bg: "#1E1830" },
};

interface Appointment {
  start: string;
  duracion: number;
  clienteNombre: string;
  servicioNombre: string;
}

interface DayTimelineProps {
  year: number;
  month: number;
  day: number;
  appointments: Appointment[];
  onBack: () => void;
  onSelectDay?: (d: number) => void;
}

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }

export function DayTimeline({ year, month, day, appointments, onBack, onSelectDay }: DayTimelineProps) {
  const START_H = 9;
  const END_H = 20;
  const HOUR_PX = 52;

  const parseMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Week strip
  const dow = (new Date(year, month, day).getDay() + 6) % 7; // Monday = 0
  const monday = day - dow;
  const dim = daysInMonth(year, month);

  const isToday = (() => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
  })();

  const weekStrip = (
    <div className="flex gap-1 px-3.5 pb-3">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const dd = monday + i;
        const valid = dd >= 1 && dd <= dim;
        const sel = dd === day;
        const hasAppts = valid && appointments.length > 0 && dd === day;

        return (
          <button
            key={i}
            onClick={() => valid && onSelectDay?.(dd)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5"
            style={{
              background: sel ? "#16203A" : "transparent",
              border: sel ? "1px solid #2A3A5E" : "1px solid transparent",
              cursor: valid ? "pointer" : "default",
            }}
          >
            <span className="text-[10px] font-bold" style={{ color: sel ? "#7FA9FF" : "#6F6F73" }}>
              {WD_LABELS[i]}
            </span>
            <span
              className="font-mono-num text-[15px]"
              style={{
                fontWeight: sel ? 700 : 500,
                color: !valid ? "#3A3A3D" : sel ? "#fff" : "#D9D9DB",
              }}
            >
              {valid ? dd : ""}
            </span>
            <span
              className="h-[5px] w-[5px] rounded-full"
              style={{ background: hasAppts ? "#7FA9FF" : "transparent" }}
            />
          </button>
        );
      })}
    </div>
  );

  // Timeline
  const hours = [];
  for (let h = START_H; h <= END_H; h++) {
    hours.push(
      <div key={h} className="absolute left-0 right-0" style={{ top: (h - START_H) * HOUR_PX, height: HOUR_PX }}>
        <span className="absolute left-0 w-11 text-right font-mono-num text-[11px] text-[#5A5A5E]" style={{ top: -7 }}>
          {String(h).padStart(2, "0")}:00
        </span>
        <span className="absolute right-2 left-[52px] top-0 h-px bg-[#1E1E20]" />
      </div>
    );
  }

  const blocks = appointments.map((a, k) => {
    const svc = SVC_STYLES[a.servicioNombre] ?? SVC_STYLES["Corte"];
    const top = (parseMin(a.start) - START_H * 60) / 60 * HOUR_PX;
    const height = a.duracion / 60 * HOUR_PX - 4;

    return (
      <div
        key={k}
        className="absolute left-[56px] right-[10px] flex items-center overflow-hidden rounded-[9px] px-2.5"
        style={{
          top,
          height: Math.max(height, 22),
          background: svc.bg,
          borderLeft: `3px solid ${svc.c}`,
        }}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 font-mono-num text-[10px] font-bold" style={{ color: svc.c }}>
            {a.start}–{(() => { const m = parseMin(a.start) + a.duracion; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; })()}
          </span>
          <span className="truncate text-[12px] font-bold text-ap-text">{a.clienteNombre}</span>
          <span className="shrink-0 text-[11px] text-ap-sub">· {a.servicioNombre}</span>
        </div>
      </div>
    );
  });

  const emptyMsg = appointments.length === 0 ? (
    <div className="absolute left-[56px] right-[10px] text-center text-[13px] text-[#5A5A5E]" style={{ top: 120 }}>
      Sin turnos este dia -- libre
    </div>
  ) : null;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
            <ChevronLeft size={16} color="#ADADB0" />
          </button>
          <div>
            <div className="font-display text-[28px] font-bold leading-tight text-white">
              {isToday ? "Hoy · " : ""}{day} {MONTHS_ABBR[month]}
            </div>
            <div className="text-xs text-ap-muted">
              {appointments.length} turno{appointments.length !== 1 ? "s" : ""}
              {appointments.length > 0 ? ` · ${Math.round(appointments.length / 12 * 100)}% ocupación` : " · día libre"}
            </div>
          </div>
        </div>
      </div>

      {weekStrip}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-5 pt-2">
        <div className="relative" style={{ height: (END_H - START_H) * HOUR_PX + 24, marginTop: 18 }}>
          {hours}
          {emptyMsg}
          {blocks}
        </div>
      </div>
    </div>
  );
}
