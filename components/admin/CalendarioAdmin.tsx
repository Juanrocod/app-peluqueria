"use client";

import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { Turno, Servicio, Peluquero } from "@prisma/client";

type TurnoConRelaciones = Turno & { servicio: Servicio; peluquero: Peluquero | null };

// 8:00 a 22:00 (incluye franja especial nocturna 20-23)
const HORAS = Array.from({ length: 15 }, (_, i) => i + 8);

const ESTADO_COLORES: Record<string, string> = {
  PENDIENTE: "bg-yellow-900/40 text-yellow-300 border-yellow-800",
  CONFIRMADO: "bg-blue-900/40 text-blue-300 border-blue-800",
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
    <div className="flex flex-col gap-3">
      {/* Barra de navegación */}
      <div className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3">
        <Link
          href={`/admin?semana=${prevLunes}`}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          ← Semana anterior
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-100">{mesLabel}</span>
          <span className="text-sm text-zinc-500">
            {format(lunes, "d", { locale: es })} – {format(addDays(lunes, 6), "d MMM", { locale: es })}
          </span>
          {semanaDesde !== format(new Date(), "yyyy-MM-dd").slice(0, 8) && (
            <Link
              href="/admin"
              className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded-full hover:bg-blue-900 transition"
            >
              Hoy
            </Link>
          )}
        </div>

        <Link
          href={`/admin?semana=${nextLunes}`}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          Semana siguiente →
        </Link>
      </div>

      {/* Grilla del calendario */}
      <div className="bg-zinc-900 rounded-xl overflow-auto">
        <div className="grid min-w-[700px]" style={{ gridTemplateColumns: `64px repeat(7, 1fr)` }}>
          {/* Header días */}
          <div className="border-b border-r border-zinc-800 bg-zinc-800" />
          {diasSemana.map((dia) => (
            <div
              key={dia.toISOString()}
              className={`border-b border-r border-zinc-800 px-2 py-3 text-center text-sm font-medium ${
                esHoy(dia) ? "bg-blue-900/30 text-blue-400" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <div className="uppercase text-xs tracking-wide">{format(dia, "EEE", { locale: es })}</div>
              <div className={`text-xl mt-0.5 ${esHoy(dia) ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                {format(dia, "d")}
              </div>
            </div>
          ))}

          {/* Filas horarias */}
          {HORAS.map((hora) => (
            <>
              <div
                key={`hora-${hora}`}
                className="border-b border-r border-zinc-800 px-2 py-1 text-xs text-zinc-500 text-right pt-2"
              >
                {hora}:00
              </div>
              {diasSemana.map((dia) => {
                const slotTurnos = turnosEnSlot(dia, hora);
                return (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className={`border-b border-r border-zinc-800 px-1 py-1 min-h-[52px] ${hora >= 20 ? "bg-purple-950/20" : ""}`}
                  >
                    {slotTurnos.map((t) => (
                      <div
                        key={t.id}
                        className={`border rounded px-2 py-1 text-xs mb-1 ${ESTADO_COLORES[t.estado] ?? "bg-zinc-800 text-zinc-300 border-zinc-700"}`}
                      >
                        <div className="font-medium truncate">{t.clienteNombre}</div>
                        <div className="truncate opacity-80">{t.servicio.nombre}</div>
                        <div className="opacity-60">{format(new Date(t.fechaHora), "HH:mm")}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-zinc-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-900/40 border border-yellow-800 inline-block" /> Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-900/40 border border-blue-800 inline-block" /> Confirmado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-950/20 border border-purple-800 inline-block" /> Franja nocturna especial
        </span>
      </div>
    </div>
  );
}
