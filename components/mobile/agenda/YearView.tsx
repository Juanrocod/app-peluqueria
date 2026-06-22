"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstWdMon(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; }

interface YearViewProps {
  year: number;
  onSelectMonth: (m: number) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export function YearView({ year, onSelectMonth, onPrevYear, onNextYear }: YearViewProps) {
  const today = new Date();
  const todayM = today.getMonth();
  const todayD = today.getDate();
  const todayY = today.getFullYear();

  const miniMonth = (m: number) => {
    const lead = firstWdMon(year, m);
    const days = daysInMonth(year, m);
    const cells: (number | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);

    const isCurrentMonth = year === todayY && m === todayM;

    return (
      <button
        key={m}
        onClick={() => onSelectMonth(m)}
        className="p-1 text-left"
      >
        <div
          className="mb-1 font-display text-[15px] font-semibold"
          style={{ color: isCurrentMonth ? "#2F6BFF" : "#F4F4F2" }}
        >
          {MONTHS[m]}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {cells.map((d, i) => {
            const isToday = d !== null && year === todayY && m === todayM && d === todayD;
            return (
              <div
                key={i}
                className="flex items-center justify-center font-mono-num text-[8px] leading-[11px]"
                style={{
                  height: 11,
                  color: !d ? "transparent" : isToday ? "#fff" : "#8A8A8E",
                  background: isToday ? "#2F6BFF" : "transparent",
                  borderRadius: "50%",
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {d ?? "·"}
              </div>
            );
          })}
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="font-display text-[28px] font-bold">{year}</div>
        <div className="flex gap-1">
          <button onClick={onPrevYear} className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
            <ChevronLeft size={16} color="#ADADB0" />
          </button>
          <button onClick={onNextYear} className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
            <ChevronRight size={16} color="#ADADB0" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        <div className="grid grid-cols-3 gap-2.5">
          {MONTHS.map((_, m) => miniMonth(m))}
        </div>
      </div>
    </div>
  );
}
