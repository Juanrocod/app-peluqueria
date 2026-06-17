"use client";

import { useState } from "react";
import { YearView } from "./YearView";
import { MonthView } from "./MonthView";
import { DayTimeline } from "./DayTimeline";

interface TurnoData {
  fechaHora: string;
  servicioNombre: string;
  clienteNombre?: string;
  duracion?: number;
}

interface AgendaScreenProps {
  turnos: TurnoData[];
}

interface DayData {
  day: number;
  services: string[];
}

export function AgendaScreen({ turnos }: AgendaScreenProps) {
  const today = new Date();
  const [view, setView] = useState<"year" | "month" | "day">("month");
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());

  const daysWithTurnos: DayData[] = (() => {
    const map = new Map<number, string[]>();
    turnos.forEach((t) => {
      const d = new Date(t.fechaHora);
      if (d.getFullYear() === selYear && d.getMonth() === selMonth) {
        const day = d.getDate();
        const existing = map.get(day) ?? [];
        existing.push(t.servicioNombre);
        map.set(day, existing);
      }
    });
    return Array.from(map.entries()).map(([day, services]) => ({ day, services }));
  })();

  if (view === "year") {
    return (
      <div className="flex flex-1 flex-col pb-16">
        <YearView
          year={selYear}
          onSelectMonth={(m) => {
            setSelMonth(m);
            setView("month");
          }}
        />
      </div>
    );
  }

  if (view === "month") {
    return (
      <div className="flex flex-1 flex-col pb-16">
        <MonthView
          year={selYear}
          month={selMonth}
          daysWithTurnos={daysWithTurnos}
          onSelectDay={(d) => {
            setSelDay(d);
            setView("day");
          }}
          onGoYear={() => setView("year")}
          onPrevMonth={() => {
            if (selMonth === 0) { setSelMonth(11); setSelYear(selYear - 1); }
            else setSelMonth(selMonth - 1);
          }}
          onNextMonth={() => {
            if (selMonth === 11) { setSelMonth(0); setSelYear(selYear + 1); }
            else setSelMonth(selMonth + 1);
          }}
        />
      </div>
    );
  }

  // Day view with timeline
  const dayAppointments = turnos
    .filter((t) => {
      const d = new Date(t.fechaHora);
      return d.getFullYear() === selYear && d.getMonth() === selMonth && d.getDate() === selDay;
    })
    .map((t) => {
      const d = new Date(t.fechaHora);
      return {
        start: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        duracion: t.duracion ?? 30,
        clienteNombre: t.clienteNombre ?? "Cliente",
        servicioNombre: t.servicioNombre,
      };
    });

  return (
    <div className="flex flex-1 flex-col pb-16">
      <DayTimeline
        year={selYear}
        month={selMonth}
        day={selDay}
        appointments={dayAppointments}
        onBack={() => setView("month")}
      />
    </div>
  );
}
