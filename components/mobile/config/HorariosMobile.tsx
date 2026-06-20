"use client";

import { useState, useTransition } from "react";
import { Clock, ChevronRight, ChevronDown, Trash2, Plus, Info } from "lucide-react";
import { crearFranjaAdmin, eliminarFranjaAdmin } from "@/actions/horarios";
import { crearBloqueoAdmin, eliminarBloqueo } from "@/actions/bloqueos";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_LETTERS = ["D", "L", "M", "X", "J", "V", "S"];
const DAY_COLORS = ["#6F6F73", "#2F6BFF", "#B79CFF", "#E8A33D", "#22D366", "#F26157", "#34D399"];

interface Franja {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: string;
  motivo: string | null;
}

interface Bloqueo {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  todoElDia: boolean;
  motivo: string | null;
}

interface HorariosMobileProps {
  horarios: Franja[];
  bloqueos: Bloqueo[];
}

export function HorariosMobile({ horarios: initialHorarios, bloqueos: initialBloqueos }: HorariosMobileProps) {
  const [horarios, setHorarios] = useState(initialHorarios);
  const [bloqueosList, setBloqueosList] = useState(initialBloqueos);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [addingFranjaDay, setAddingFranjaDay] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const positivas = horarios.filter((h) => h.tipoFranja === "POSITIVA");
  const dayFranjas = (dia: number) => positivas.filter((h) => h.diaSemana === dia);
  const dayHasSchedule = (dia: number) => dayFranjas(dia).length > 0;

  const dayRange = (dia: number) => {
    const f = dayFranjas(dia);
    if (f.length === 0) return "Cerrado";
    return f.map((fr) => `${fr.horaApertura}-${fr.horaCierre}`).join(" · ");
  };

  function handleDeleteFranja(id: string) {
    setHorarios((prev) => prev.filter((h) => h.id !== id));
    startTransition(async () => {
      await eliminarFranjaAdmin(id);
    });
  }

  function handleAddFranja(form: FormData, dia: number) {
    const desde = form.get("desde") as string;
    const hasta = form.get("hasta") as string;
    const tempId = `temp-${Date.now()}`;
    setHorarios((prev) => [
      ...prev,
      { id: tempId, diaSemana: dia, horaApertura: desde, horaCierre: hasta, tipoFranja: "POSITIVA", motivo: null },
    ]);
    setAddingFranjaDay(null);
    startTransition(async () => {
      await crearFranjaAdmin({ diaSemana: dia, horaApertura: desde, horaCierre: hasta, tipoFranja: "POSITIVA" });
    });
  }

  function handleToggleDay(dia: number) {
    const franjas = dayFranjas(dia);
    if (franjas.length > 0) {
      setHorarios((prev) => prev.filter((h) => !(h.diaSemana === dia && h.tipoFranja === "POSITIVA")));
      startTransition(async () => {
        for (const fr of franjas) {
          await eliminarFranjaAdmin(fr.id);
        }
      });
    } else {
      const tempId = `temp-${Date.now()}`;
      setHorarios((prev) => [
        ...prev,
        { id: tempId, diaSemana: dia, horaApertura: "09:00", horaCierre: "18:00", tipoFranja: "POSITIVA", motivo: null },
      ]);
      setExpandedDay(dia);
      startTransition(async () => {
        await crearFranjaAdmin({ diaSemana: dia, horaApertura: "09:00", horaCierre: "18:00", tipoFranja: "POSITIVA" });
      });
    }
  }

  function handleToggleBloqueo(dateStr: string) {
    const existing = bloqueosList.find((b) => b.fecha === dateStr);
    if (existing) {
      setBloqueosList((prev) => prev.filter((b) => b.id !== existing.id));
      startTransition(async () => {
        await eliminarBloqueo(existing.id);
      });
    } else {
      const tempId = `temp-${Date.now()}`;
      setBloqueosList((prev) => [
        ...prev,
        { id: tempId, fecha: dateStr, horaInicio: "00:00", horaFin: "23:59", todoElDia: true, motivo: null },
      ]);
      startTransition(async () => {
        const [y, m, d] = dateStr.split("-").map(Number);
        await crearBloqueoAdmin({
          fecha: new Date(y, m - 1, d),
          todoElDia: true,
          horaInicio: "00:00",
          horaFin: "23:59",
        });
      });
    }
  }

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstWd = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const calCells: (number | null)[] = [];
  for (let i = 0; i < firstWd; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);
  while (calCells.length % 7) calCells.push(null);

  const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="pb-4">
      <div className="mb-4 flex items-center gap-2.5 px-4">
        <Clock size={19} color="#F26157" />
        <span className="font-display text-xl font-semibold">Horarios</span>
      </div>

      <div className="px-4">
        <div className="mb-4 rounded-2xl border border-ap-border-soft bg-ap-s1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E1E20]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ap-muted">Días y horarios</span>
            <span className="text-[11px] text-ap-muted">Tocá para gestionar</span>
          </div>

          {[1, 2, 3, 4, 5, 6, 0].map((dia) => {
            const active = dayHasSchedule(dia);
            const expanded = expandedDay === dia;
            const franjas = dayFranjas(dia);

            return (
              <div key={dia} className="border-b border-[#1E1E20] last:border-b-0">
                <div className="flex w-full items-center gap-3 px-4 py-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: active ? `${DAY_COLORS[dia]}20` : "#1E1E20", color: active ? DAY_COLORS[dia] : "#6F6F73" }}
                  >
                    {DAY_LETTERS[dia]}
                  </span>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${active ? "text-ap-text" : "text-ap-muted"}`}>{DAYS[dia]}</div>
                    <div className="text-[11px] text-ap-muted">{dayRange(dia)}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleDay(dia); }}
                    disabled={isPending}
                    className="relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-150"
                    style={{ background: active ? "#22D366" : "#2A2A2C" }}
                  >
                    <span className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] duration-150" style={{ left: active ? 21 : 3 }} />
                  </button>
                  <button
                    onClick={() => setExpandedDay(expanded ? null : dia)}
                    className="flex shrink-0"
                    disabled={!active}
                  >
                    {expanded
                      ? <ChevronDown size={16} color="#2F6BFF" />
                      : <ChevronRight size={16} color={active ? "#6F6F73" : "#3A3A3D"} />
                    }
                  </button>
                </div>

                {expanded && (
                  <div className="border-t border-[#1E1E20] bg-[#161618] px-4 py-3">
                    {franjas.map((fr) => (
                      <div key={fr.id} className="mb-2 flex items-center gap-2 rounded-[10px] border border-[#2A3A2C] bg-[#1A2A1C] px-3.5 py-2.5">
                        <span className="flex-1 font-mono-num text-sm font-bold text-ap-text">
                          {fr.horaApertura} → {fr.horaCierre}
                        </span>
                        <button onClick={() => handleDeleteFranja(fr.id)} disabled={isPending} className="flex text-ap-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {franjas.length === 0 && (
                      <div className="mb-2 text-center text-xs text-ap-muted">Sin franjas — agregá una para activar el día</div>
                    )}

                    {addingFranjaDay === dia ? (
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleAddFranja(new FormData(e.currentTarget), dia); }}
                        className="mt-2 flex items-center gap-2"
                      >
                        <input name="desde" type="time" defaultValue="09:00" required className="flex-1 rounded-lg border border-ap-border-soft bg-ap-s1 px-2 py-1.5 font-mono-num text-sm text-ap-text outline-none" />
                        <span className="text-ap-muted">→</span>
                        <input name="hasta" type="time" defaultValue="18:00" required className="flex-1 rounded-lg border border-ap-border-soft bg-ap-s1 px-2 py-1.5 font-mono-num text-sm text-ap-text outline-none" />
                        <button type="submit" disabled={isPending} className="rounded-lg bg-[#22D366] px-3 py-1.5 text-xs font-bold text-[#08130D]">✓</button>
                        <button type="button" onClick={() => setAddingFranjaDay(null)} className="text-xs text-ap-muted">✕</button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setAddingFranjaDay(dia)}
                        className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ap-sub"
                      >
                        <Plus size={14} /> Agregar franja
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-4 rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Servicio a domicilio</div>
              <div className="text-[11px] text-ap-muted">Activado</div>
            </div>
            <span className="relative h-[26px] w-[44px] rounded-full bg-[#22D366]">
              <span className="absolute top-[3px] left-[21px] h-5 w-5 rounded-full bg-white" />
            </span>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-[#1D2E55] bg-[rgba(47,107,255,.08)] px-3 py-2.5">
            <Info size={14} color="#2F6BFF" className="mt-0.5 shrink-0" />
            <span className="text-xs leading-relaxed text-ap-sub">
              Cada turno a domicilio bloquea <strong className="text-ap-text">45 min antes</strong> y <strong className="text-ap-text">45 min después</strong> para el traslado.
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-ap-border-soft bg-ap-s1 p-4">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ap-muted">Días bloqueados</div>
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="text-ap-sub">&lt;</button>
            <span className="text-sm font-semibold">{MONTHS[calMonth]} {calYear}</span>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="text-ap-sub">&gt;</button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-px">
            {["L", "M", "X", "J", "V", "S", "D"].map((w, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-ap-muted">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {calCells.map((d, i) => {
              if (!d) return <div key={i} className="h-9" />;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isBlocked = bloqueosList.some((b) => b.fecha === dateStr);
              const isTodayCell = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
              const isPast = new Date(calYear, calMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <button
                  key={i}
                  disabled={isPast}
                  onClick={() => handleToggleBloqueo(dateStr)}
                  className="flex h-9 items-center justify-center rounded-lg font-mono-num text-xs transition-colors"
                  style={{
                    background: isBlocked ? "rgba(242,97,87,.2)" : "transparent",
                    color: isPast ? "#3A3A3D" : isBlocked ? "#F26157" : isTodayCell ? "#2F6BFF" : "#D9D9DB",
                    border: isTodayCell ? "1px solid #2F6BFF" : "1px solid transparent",
                    fontWeight: isTodayCell || isBlocked ? 700 : 400,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[10px] text-ap-muted">
            <span className="h-2.5 w-2.5 rounded-sm bg-[rgba(242,97,87,.3)]" />
            Tocá un día para bloquearlo/desbloquearlo
          </div>
        </div>
      </div>
    </div>
  );
}
