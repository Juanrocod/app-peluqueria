"use client";

import React from "react";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { Turno, Servicio, Peluquero } from "@prisma/client";

type TurnoConRelaciones = Turno & { servicio: Servicio; peluquero: Peluquero | null };

// 8:00 a 22:00 (incluye franja especial nocturna 20-23)
const HORAS = Array.from({ length: 15 }, (_, i) => i + 8);

const ESTADO_COLORES: Record<string, string> = {
  PENDIENTE: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15",
  CONFIRMADO: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15",
};

export default function CalendarioAdmin({
  turnos,
  semanaDesde,
  hoy,
}: {
  turnos: TurnoConRelaciones[];
  semanaDesde: string; // "yyyy-MM-dd" del lunes
  hoy: string;         // "yyyy-MM-dd" de hoy
}) {
  const [ly, lm, ld] = semanaDesde.split("-").map(Number);
  const lunes = new Date(ly, lm - 1, ld);

  // lunes → domingo (7 días)
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(lunes, i));

  const prevLunes = format(subDays(lunes, 7), "yyyy-MM-dd");
  const nextLunes = format(addDays(lunes, 7), "yyyy-MM-dd");

  const mesLabel = (() => {
    const mesInicio = format(lunes, "MMM", { locale: es });
    const mesFin = format(addDays(lunes, 6), "MMM", { locale: es });
    const anio = format(lunes, "yyyy");
    const label = mesInicio === mesFin ? `${mesInicio} ${anio}` : `${mesInicio} – ${mesFin} ${anio}`;
    return label.charAt(0).toUpperCase() + label.slice(1);
  })();

  function turnosEnSlot(dia: Date, hora: number) {
    return turnos.filter((t) => {
      const f = new Date(t.fechaHora);
      return (
        f.getFullYear() === dia.getFullYear() &&
        f.getMonth() === dia.getMonth() &&
        f.getDate() === dia.getDate() &&
        f.getHours() === hora
      );
    });
  }

  function esHoy(dia: Date) {
    return format(dia, "yyyy-MM-dd") === hoy;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de navegación */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm px-4 py-3">
        <Link
          href={`/admin?semana=${prevLunes}`}
          className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all duration-200"
        >
          ← Semana anterior
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-800 dark:text-zinc-100">{mesLabel}</span>
          <span className="text-sm text-zinc-400 dark:text-zinc-500">
            {format(lunes, "d", { locale: es })} – {format(addDays(lunes, 6), "d MMM", { locale: es })}
          </span>
          {semanaDesde !== format(new Date(), "yyyy-MM-dd").slice(0, 8) && (
            <Link
              href="/admin"
              className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200"
            >
              Hoy
            </Link>
          )}
        </div>

        <Link
          href={`/admin?semana=${nextLunes}`}
          className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all duration-200"
        >
          Semana siguiente →
        </Link>
      </div>

      {/* Grilla del calendario */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-auto">
        <div className="grid min-w-[700px]" style={{ gridTemplateColumns: `64px repeat(7, 1fr)` }}>
          {/* Header días */}
          <div className="border-b border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50" />
          {diasSemana.map((dia) => (
            <div
              key={dia.toISOString()}
              className={`border-b border-r border-zinc-200 dark:border-zinc-800/80 px-2 py-3 text-center text-sm font-medium ${
                esHoy(dia) ? "bg-blue-50/40 dark:bg-blue-950/10 text-blue-700 dark:text-blue-400" : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <div className="uppercase text-xs tracking-wide text-zinc-500 dark:text-zinc-400">{format(dia, "EEE", { locale: es })}</div>
              <div className={`text-lg font-semibold mt-1 ${esHoy(dia) ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-sm" : "text-zinc-800 dark:text-zinc-200"}`}>
                {format(dia, "d")}
              </div>
            </div>
          ))}

          {/* Filas horarias */}
          {HORAS.map((hora) => (
            <React.Fragment key={`hora-row-${hora}`}>
              <div
                className="border-b border-r border-zinc-200 dark:border-zinc-800/80 px-2 py-1 text-xs text-zinc-400 dark:text-zinc-500 text-right pt-2"
              >
                {hora}:00
              </div>
              {diasSemana.map((dia) => {
                const slotTurnos = turnosEnSlot(dia, hora);
                const isNocturna = hora >= 20;
                return (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className={`border-b border-r border-zinc-200 dark:border-zinc-800/80 px-1 py-1 min-h-[56px] transition-colors ${
                      isNocturna
                        ? "bg-violet-500/[0.04] dark:bg-violet-500/[0.08]"
                        : "bg-transparent"
                    }`}
                  >
                    {slotTurnos.map((t) => (
                      <div
                        key={t.id}
                        className={`border rounded-lg p-1.5 text-[11px] leading-tight mb-1 shadow-sm transition-all duration-200 ${
                          ESTADO_COLORES[t.estado] ?? "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <div className="font-semibold truncate">{t.clienteNombre}</div>
                        <div className="truncate opacity-90">{t.servicio.nombre}</div>
                        <div className="opacity-75 font-mono text-[10px] mt-0.5 block">{format(new Date(t.fechaHora), "HH:mm")}</div>
                       </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 px-1 py-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/20 inline-block" /> Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500/10 border border-blue-500/20 inline-block" /> Confirmado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-violet-500/10 border border-violet-500/20 inline-block" /> Franja nocturna especial
        </span>
      </div>
    </div>
  );
}
