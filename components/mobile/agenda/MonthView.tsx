"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WD = ["L", "M", "M", "J", "V", "S", "D"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstWdMon(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; }

const SVC_COLORS: Record<string, string> = {
  "Coloración": "#7FA9FF",
  "Corte": "#34D399",
  "Corte de pelo": "#34D399",
  "Corte + barba": "#34D399",
  "Peinado": "#E8A33D",
  "Tratamiento": "#B79CFF",
  "Tratamiento capilar": "#B79CFF",
};

interface DayData {
  day: number;
  services: string[];
}

interface MonthViewProps {
  year: number;
  month: number;
  daysWithTurnos: DayData[];
  onSelectDay: (d: number) => void;
  onGoYear: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthView({ year, month, daysWithTurnos, onSelectDay, onGoYear, onPrevMonth, onNextMonth }: MonthViewProps) {
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const lead = firstWdMon(year, month);
  const days = daysInMonth(year, month);
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const turnoMap = new Map<number, string[]>();
  daysWithTurnos.forEach((d) => turnoMap.set(d.day, d.services));

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2.5">
        <button onClick={onGoYear} className="flex items-baseline gap-1.5 p-0">
          <span className="font-display text-[28px] font-bold text-white">{MONTHS_FULL[month]}</span>
          <span className="font-mono-num text-[13px] text-ap-muted">{year}</span>
        </button>
        <div className="flex gap-1">
          <button onClick={onPrevMonth} className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
            <ChevronLeft size={16} color="#ADADB0" />
          </button>
          <button onClick={onNextMonth} className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
            <ChevronRight size={16} color="#ADADB0" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-3.5 pb-1.5">
        {WD.map((w, i) => (
          <div key={i} className="text-center text-[10px] font-bold uppercase tracking-wider text-ap-muted">{w}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="h-[52px]" />;
            const isToday = year === todayY && month === todayM && d === todayD;
            const services = turnoMap.get(d) ?? [];
            const hasTurnos = services.length > 0;

            return (
              <button
                key={i}
                onClick={() => onSelectDay(d)}
                className="flex h-[52px] flex-col items-center gap-0.5 pt-1"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full font-mono-num text-[13px]"
                  style={{
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "#fff" : "#E4E4E6",
                    background: isToday ? "#2F6BFF" : "transparent",
                  }}
                >
                  {d}
                </span>
                <div className="flex gap-0.5" style={{ height: 5 }}>
                  {services.slice(0, 3).map((s, k) => (
                    <span
                      key={k}
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ background: SVC_COLORS[s] ?? "#34D399" }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
