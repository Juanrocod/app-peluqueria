import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import React from "react";
import type { Turno, Servicio } from "@prisma/client";

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const NOMBRES_DIA   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const HORAS = Array.from({ length: 13 }, (_, i) => i + 8); // 8h a 20h

type HorarioRow = {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
};

type BloqueoRow = {
  fecha: string; // "yyyy-MM-dd"
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
};

type TurnoSimple = Turno & { servicio: Servicio };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function slotStr(hora: number) {
  return `${pad2(hora)}:00`;
}

function getCellState(
  diaSemana: number,
  hora: number,
  diaISO: string,
  horarios: HorarioRow[],
  bloqueos: BloqueoRow[]
): "open" | "blocked" | "closed" {
  const slot = slotStr(hora);
  const slotEnd = slotStr(hora + 1);

  // Capa 3: bloqueo puntual del día
  const bloqueosDia = bloqueos.filter((b) => b.fecha === diaISO);
  for (const b of bloqueosDia) {
    if (b.todoElDia) return "blocked";
    if (slot >= b.horaInicio && slot < b.horaFin) return "blocked";
  }

  // Capa 2: franja NEGATIVA recurrente
  const negativas = horarios.filter(
    (h) => h.diaSemana === diaSemana && h.tipoFranja === "NEGATIVA"
  );
  for (const n of negativas) {
    if (slot >= n.horaApertura && slot < n.horaCierre) return "blocked";
  }

  // Capa 1: franja POSITIVA
  const positivas = horarios.filter(
    (h) => h.diaSemana === diaSemana && h.tipoFranja === "POSITIVA"
  );
  for (const p of positivas) {
    if (slot >= p.horaApertura && slotEnd <= p.horaCierre) return "open";
    if (slot >= p.horaApertura && slot < p.horaCierre) return "open";
  }

  return "closed";
}

const CELL_STYLES = {
  open:    "bg-slot-open-bg border border-slot-open-border",
  blocked: "bg-slot-block-bg border border-slot-block-border",
  closed:  "bg-ap-s1 border border-ap-s1",
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE:  "bg-amber-900/60 border-amber-700/50 text-amber-300",
  CONFIRMADO: "bg-violet-900/60 border-ap-border text-ap-accent",
  COMPLETADO: "bg-slate-800/60 border-slate-700/50 text-slate-400",
};

export default function ScheduleGrid({
  turnos,
  horarios,
  bloqueos,
  semanaDesde,
  hoy,
}: {
  turnos: TurnoSimple[];
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
  semanaDesde: string;
  hoy: string;
}) {
  const [ly, lm, ld] = semanaDesde.split("-").map(Number);
  const lunes = new Date(ly, lm - 1, ld);

  const diasOrdenados = ORDEN_SEMANA.map((ds) => {
    const offset = ds === 0 ? 6 : ds - 1;
    return { date: addDays(lunes, offset), diaSemana: ds };
  });

  const prevLunes = format(addDays(lunes, -7), "yyyy-MM-dd");
  const nextLunes = format(addDays(lunes, 7), "yyyy-MM-dd");

  function turnosEnSlot(diaDate: Date, hora: number) {
    return turnos.filter((t) => {
      const f = new Date(t.fechaHora);
      return (
        f.getFullYear() === diaDate.getFullYear() &&
        f.getMonth() === diaDate.getMonth() &&
        f.getDate() === diaDate.getDate() &&
        f.getHours() === hora
      );
    });
  }

  const mesLabel = (() => {
    const ini = format(lunes, "MMM", { locale: es });
    const fin = format(addDays(lunes, 6), "MMM", { locale: es });
    const yr  = format(lunes, "yyyy");
    const lbl = ini === fin ? `${ini} ${yr}` : `${ini} – ${fin} ${yr}`;
    return lbl.charAt(0).toUpperCase() + lbl.slice(1);
  })();

  return (
    <div className="flex h-full flex-col gap-0">
      {/* Header de navegación de semana */}
      <div className="flex items-center justify-between border-b border-ap-border bg-ap-s2 px-4 py-3">
        <Link
          href={`/admin?semana=${prevLunes}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-sub transition hover:bg-ap-border hover:text-ap-text"
          aria-label="Semana anterior"
        >
          ‹
        </Link>
        <div className="text-center">
          <p className="text-sm font-semibold text-ap-text">{mesLabel}</p>
          <p className="text-xs text-ap-accent">
            {format(lunes, "d", { locale: es })} –{" "}
            {format(addDays(lunes, 6), "d MMM", { locale: es })}
          </p>
        </div>
        <Link
          href={`/admin?semana=${nextLunes}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ap-sub transition hover:bg-ap-border hover:text-ap-text"
          aria-label="Semana siguiente"
        >
          ›
        </Link>
      </div>

      {/* Grilla */}
      <div className="flex-1 overflow-auto">
        <div
          className="grid min-w-[360px]"
          style={{ gridTemplateColumns: "36px repeat(7, 1fr)" }}
        >
          {/* Cabecera de días */}
          <div className="sticky top-0 z-10 border-b border-ap-border bg-ap-s2" />
          {diasOrdenados.map(({ date, diaSemana }) => {
            const iso  = format(date, "yyyy-MM-dd");
            const esHoy = iso === hoy;
            return (
              <div
                key={diaSemana}
                className={`sticky top-0 z-10 border-b border-r border-ap-border px-1 py-2 text-center ${
                  esHoy ? "bg-ap-border" : "bg-ap-s2"
                }`}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-ap-muted">
                  {NOMBRES_DIA[diaSemana]}
                </p>
                <p
                  className={`mt-0.5 text-base font-bold ${
                    esHoy ? "text-ap-accent" : "text-ap-text"
                  }`}
                >
                  {format(date, "d")}
                </p>
              </div>
            );
          })}

          {/* Filas horarias */}
          {HORAS.map((hora) => (
            <React.Fragment key={hora}>
              <div
                className="border-b border-r border-ap-border px-1 pt-1.5 text-right text-[9px] text-ap-muted"
              >
                {hora}h
              </div>
              {diasOrdenados.map(({ date, diaSemana }) => {
                const iso   = format(date, "yyyy-MM-dd");
                const state = getCellState(diaSemana, hora, iso, horarios, bloqueos);
                const slotTurnos = turnosEnSlot(date, hora);
                return (
                  <div
                    key={`${diaSemana}-${hora}`}
                    className={`min-h-[44px] border-b border-r border-ap-border p-0.5 ${CELL_STYLES[state]}`}
                  >
                    {slotTurnos.map((t) => (
                      <div
                        key={t.id}
                        className={`mb-0.5 rounded border px-1 py-0.5 text-[9px] leading-tight ${
                          ESTADO_COLORS[t.estado] ?? "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <p className="truncate font-semibold">{t.clienteNombre}</p>
                        <p className="truncate opacity-70">{t.servicio.nombre}</p>
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
      <div className="flex gap-4 border-t border-ap-border bg-ap-s2 px-4 py-2 text-[10px] text-ap-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slot-open-bg border border-slot-open-border" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slot-block-bg border border-slot-block-border" />
          Bloqueado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-ap-s1 border border-ap-border" />
          Cerrado
        </span>
      </div>
    </div>
  );
}
