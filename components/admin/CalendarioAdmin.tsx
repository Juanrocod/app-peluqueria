"use client";

import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { Turno, Servicio, Peluquero } from "@prisma/client";

type TurnoConRelaciones = Turno & { servicio: Servicio; peluquero: Peluquero | null };

// 8:00 a 22:00 (incluye franja especial nocturna 20-23)
const HORAS = Array.from({ length: 15 }, (_, i) => i + 8);

const ESTADO_COLORES: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMADO: "bg-blue-100 text-blue-800 border-blue-200",
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
      <div className="flex items-center justify-between bg-white rounded-xl shadow px-4 py-3">
        <Link
          href={`/admin?semana=${prevLunes}`}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          ← Semana anterior
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800">{mesLabel}</span>
          <span className="text-sm text-gray-400">
            {format(lunes, "d", { locale: es })} – {format(addDays(lunes, 6), "d MMM", { locale: es })}
          </span>
          {semanaDesde !== format(new Date(), "yyyy-MM-dd").slice(0, 8) && (
            <Link
              href="/admin"
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition"
            >
              Hoy
            </Link>
          )}
        </div>

        <Link
          href={`/admin?semana=${nextLunes}`}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
        >
          Semana siguiente →
        </Link>
      </div>

      {/* Grilla del calendario */}
      <div className="bg-white rounded-xl shadow overflow-auto">
        <div className="grid min-w-[700px]" style={{ gridTemplateColumns: `64px repeat(7, 1fr)` }}>
          {/* Header días */}
          <div className="border-b border-r bg-gray-50" />
          {diasSemana.map((dia) => (
            <div
              key={dia.toISOString()}
              className={`border-b border-r px-2 py-3 text-center text-sm font-medium ${
                esHoy(dia) ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"
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
                className="border-b border-r px-2 py-1 text-xs text-gray-400 text-right pt-2"
              >
                {hora}:00
              </div>
              {diasSemana.map((dia) => {
                const slotTurnos = turnosEnSlot(dia, hora);
                return (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className={`border-b border-r px-1 py-1 min-h-[52px] ${hora >= 20 ? "bg-purple-50/40" : ""}`}
                  >
                    {slotTurnos.map((t) => (
                      <div
                        key={t.id}
                        className={`border rounded px-2 py-1 text-xs mb-1 ${ESTADO_COLORES[t.estado] ?? "bg-gray-100 text-gray-700"}`}
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
      <div className="flex gap-4 text-xs text-gray-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200 inline-block" /> Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" /> Confirmado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-100 border border-purple-200 inline-block" /> Franja nocturna especial
        </span>
      </div>
    </div>
  );
}
