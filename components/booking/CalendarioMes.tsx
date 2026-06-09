"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isToday,
  isSameDay,
  format,
  addMonths,
  subMonths,
  parseISO,
  startOfToday,
} from "date-fns";
import { es } from "date-fns/locale";

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

type Props = {
  value: string;
  onChange: (fecha: string) => void;
  // Fechas "yyyy-MM-dd" sin disponibilidad: se muestran apagadas y no son clickables
  diasSinSlots?: Set<string>;
  // Callback al navegar de mes para que el padre re-fetchee disponibilidad
  onMesChange?: (mes: string) => void;
};

export default function CalendarioMes({ value, onChange, diasSinSlots, onMesChange }: Props) {
  const [mesActual, setMesActual] = useState<Date>(() => startOfMonth(new Date()));

  const hoy = startOfToday();
  const primerDia = startOfMonth(mesActual);
  const diasDelMes = eachDayOfInterval({ start: primerDia, end: endOfMonth(mesActual) });
  const offset = (getDay(primerDia) + 6) % 7;
  const mesEsActual =
    mesActual.getFullYear() === hoy.getFullYear() &&
    mesActual.getMonth() === hoy.getMonth();
  const diaSeleccionado = value ? parseISO(value) : null;

  function handlePrevMes() {
    if (mesEsActual) return;
    const nuevo = subMonths(mesActual, 1);
    setMesActual(nuevo);
    onMesChange?.(format(nuevo, "yyyy-MM"));
  }

  function handleNextMes() {
    const nuevo = addMonths(mesActual, 1);
    setMesActual(nuevo);
    onMesChange?.(format(nuevo, "yyyy-MM"));
  }

  function handleSelectDia(dia: Date) {
    if (isBefore(dia, hoy)) return;
    const fechaStr = format(dia, "yyyy-MM-dd");
    if (diasSinSlots?.has(fechaStr)) return; // bloqueado por disponibilidad
    onChange(fechaStr);
  }

  const mesLabel = format(mesActual, "MMMM yyyy", { locale: es });
  const mesLabelCapitalized = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMes}
          disabled={mesEsActual}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-700 hover:text-slate-200 transition text-lg"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-slate-200 tracking-tight">
          {mesLabelCapitalized}
        </span>
        <button
          type="button"
          onClick={handleNextMes}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-200 transition text-lg"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold uppercase tracking-widest text-slate-600 pb-2"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: offset }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {diasDelMes.map((dia) => {
          const pasado = isBefore(dia, hoy);
          const fechaStr = format(dia, "yyyy-MM-dd");
          const sinDisponibilidad = !pasado && diasSinSlots?.has(fechaStr);
          const esHoy = isToday(dia);
          const seleccionado = diaSeleccionado ? isSameDay(dia, diaSeleccionado) : false;
          const deshabilitado = pasado || !!sinDisponibilidad;

          let clases =
            "flex items-center justify-center rounded-lg min-h-[40px] text-[13px] font-medium transition select-none ";

          if (pasado) {
            clases += "text-[#1e3a5f] cursor-not-allowed";
          } else if (sinDisponibilidad) {
            // Día bloqueado por el admin: apagado con una línea tachada sutil
            clases += "text-slate-700 cursor-not-allowed line-through decoration-slate-800";
          } else if (seleccionado) {
            clases += "bg-gradient-to-br from-blue-500 to-violet-600 text-white font-bold shadow-[0_3px_12px_rgba(99,102,241,0.5)]";
          } else if (esHoy) {
            clases += "text-sky-400 font-bold outline outline-[1.5px] outline-sky-500 outline-offset-[-1.5px] cursor-pointer";
          } else {
            clases += "text-slate-400 hover:bg-slate-800 hover:text-sky-300 cursor-pointer";
          }

          return (
            <button
              key={dia.toISOString()}
              type="button"
              disabled={deshabilitado}
              onClick={() => handleSelectDia(dia)}
              className={clases}
            >
              {format(dia, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
