"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearFranjaAdmin, eliminarFranjaAdmin } from "@/actions/horarios";
import { crearBloqueoAdmin, eliminarBloqueo } from "@/actions/bloqueos";

const NOMBRES_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]; // Lun → Dom

type HorarioRow = {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
  motivo?: string | null;
};

type BloqueoRow = {
  id: string;
  fecha: string; // "yyyy-MM-dd"
  horaInicio: string;
  horaFin: string;
  todoElDia: boolean;
  motivo?: string | null;
};

type Tab = "base" | "descansos" | "bloqueos";

export default function PanelHorarios({
  horarios,
  bloqueos,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("base");
  const [pending, startTransition] = useTransition();

  const [fBase, setFBase] = useState({ dia: "1", apertura: "09:00", cierre: "19:00" });
  const [fDesc, setFDesc] = useState({ dia: "1", apertura: "13:00", cierre: "14:00", motivo: "" });
  const [fBloqueo, setFBloqueo] = useState({
    fecha: "",
    todoElDia: true,
    horaInicio: "09:00",
    horaFin: "18:00",
    motivo: "",
  });

  const positivas = horarios.filter((h) => h.tipoFranja === "POSITIVA");
  const negativas = horarios.filter((h) => h.tipoFranja === "NEGATIVA");

  function refresh() { router.refresh(); }

  function addFranja(tipo: "POSITIVA" | "NEGATIVA", dia: string, ap: string, ci: string, mot?: string) {
    startTransition(async () => {
      await crearFranjaAdmin({ diaSemana: parseInt(dia), horaApertura: ap, horaCierre: ci, tipoFranja: tipo, motivo: mot || undefined });
      refresh();
    });
  }

  function delFranja(id: string) {
    startTransition(async () => { await eliminarFranjaAdmin(id); refresh(); });
  }

  function addBloqueo() {
    if (!fBloqueo.fecha) return;
    const [y, m, d] = fBloqueo.fecha.split("-").map(Number);
    startTransition(async () => {
      await crearBloqueoAdmin({
        fecha: new Date(y, m - 1, d),
        todoElDia: fBloqueo.todoElDia,
        horaInicio: fBloqueo.todoElDia ? "00:00" : fBloqueo.horaInicio,
        horaFin: fBloqueo.todoElDia ? "23:59" : fBloqueo.horaFin,
        motivo: fBloqueo.motivo || undefined,
      });
      setFBloqueo((p) => ({ ...p, fecha: "", motivo: "" }));
      refresh();
    });
  }

  function delBloqueo(id: string) {
    startTransition(async () => { await eliminarBloqueo(id); refresh(); });
  }

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500";
  const labelCls = "text-xs text-slate-500 mb-1 block";

  return (
    <div className="flex flex-col gap-8">
      {/* ── Vista semanal (solo lectura) ───────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Vista semanal
        </h3>
        <div className="grid grid-cols-7 gap-1.5 rounded-xl border border-slate-700/60 p-3 bg-slate-900/40">
          {ORDEN_SEMANA.map((dia) => {
            const pos = positivas.filter((h) => h.diaSemana === dia);
            const neg = negativas.filter((h) => h.diaSemana === dia);
            return (
              <div key={dia} className="flex flex-col gap-1 min-w-0">
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-800">
                  {NOMBRES_DIA[dia]}
                </div>
                {pos.length === 0 && neg.length === 0 ? (
                  <div className="text-center text-[10px] text-slate-700 py-1">—</div>
                ) : null}
                {pos.map((h) => (
                  <div
                    key={h.id}
                    title={`Atención: ${h.horaApertura}–${h.horaCierre}`}
                    className="rounded px-1 py-0.5 bg-emerald-900/40 border border-emerald-700/40 text-[9px] text-emerald-400 text-center font-mono truncate"
                  >
                    {h.horaApertura}–{h.horaCierre}
                  </div>
                ))}
                {neg.map((h) => (
                  <div
                    key={h.id}
                    title={h.motivo ? `Descanso: ${h.horaApertura}–${h.horaCierre} (${h.motivo})` : `Descanso: ${h.horaApertura}–${h.horaCierre}`}
                    className="rounded px-1 py-0.5 bg-orange-900/40 border border-orange-700/40 text-[9px] text-orange-400 text-center font-mono truncate"
                  >
                    {h.horaApertura}–{h.horaCierre}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-2">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-emerald-700 inline-block" />
            Horario de atención
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-sm bg-orange-700 inline-block" />
            Descanso recurrente
          </span>
        </div>
      </div>

      {/* ── Formularios de configuración ───────────────────────────── */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Configuración
        </h3>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {(["base", "descansos", "bloqueos"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                tab === t
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {t === "base" ? "Horario base" : t === "descansos" ? "Descansos" : "Bloquear agenda"}
            </button>
          ))}
        </div>

        {/* ── Tab: Horario base (POSITIVA) ── */}
        {tab === "base" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              {ORDEN_SEMANA.flatMap((dia) =>
                positivas
                  .filter((h) => h.diaSemana === dia)
                  .map((h) => (
                    <div key={h.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-200 w-8 inline-block">{NOMBRES_DIA[h.diaSemana]}</span>
                        <span className="font-mono ml-2 text-emerald-400">{h.horaApertura} – {h.horaCierre}</span>
                      </span>
                      <button
                        onClick={() => delFranja(h.id)}
                        disabled={pending}
                        className="text-slate-600 hover:text-red-400 transition text-xl leading-none px-1"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  ))
              )}
              {positivas.length === 0 && (
                <p className="text-sm text-slate-600 italic">Sin horarios configurados aún.</p>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Agregar ventana de atención
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Día</label>
                  <select
                    value={fBase.dia}
                    onChange={(e) => setFBase((p) => ({ ...p, dia: e.target.value }))}
                    className={inputCls}
                  >
                    {ORDEN_SEMANA.map((d) => (
                      <option key={d} value={d}>{NOMBRES_DIA[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Apertura</label>
                  <input
                    type="time"
                    value={fBase.apertura}
                    onChange={(e) => setFBase((p) => ({ ...p, apertura: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Cierre</label>
                  <input
                    type="time"
                    value={fBase.cierre}
                    onChange={(e) => setFBase((p) => ({ ...p, cierre: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <button
                onClick={() => addFranja("POSITIVA", fBase.dia, fBase.apertura, fBase.cierre)}
                disabled={pending}
                className="mt-3 w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-semibold transition"
              >
                {pending ? "Guardando..." : "Agregar horario de atención"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Descansos (NEGATIVA) ── */}
        {tab === "descansos" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              {ORDEN_SEMANA.flatMap((dia) =>
                negativas
                  .filter((h) => h.diaSemana === dia)
                  .map((h) => (
                    <div key={h.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-200 w-8 inline-block">{NOMBRES_DIA[h.diaSemana]}</span>
                        <span className="font-mono ml-2 text-orange-400">{h.horaApertura} – {h.horaCierre}</span>
                        {h.motivo && <span className="text-slate-500 ml-2 text-xs">({h.motivo})</span>}
                      </span>
                      <button
                        onClick={() => delFranja(h.id)}
                        disabled={pending}
                        className="text-slate-600 hover:text-red-400 transition text-xl leading-none px-1"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  ))
              )}
              {negativas.length === 0 && (
                <p className="text-sm text-slate-600 italic">Sin descansos configurados aún.</p>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Agregar franja de descanso / almuerzo
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Día</label>
                  <select
                    value={fDesc.dia}
                    onChange={(e) => setFDesc((p) => ({ ...p, dia: e.target.value }))}
                    className={inputCls}
                  >
                    {ORDEN_SEMANA.map((d) => (
                      <option key={d} value={d}>{NOMBRES_DIA[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Desde</label>
                  <input
                    type="time"
                    value={fDesc.apertura}
                    onChange={(e) => setFDesc((p) => ({ ...p, apertura: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Hasta</label>
                  <input
                    type="time"
                    value={fDesc.cierre}
                    onChange={(e) => setFDesc((p) => ({ ...p, cierre: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelCls}>Motivo (opcional)</label>
                <input
                  type="text"
                  value={fDesc.motivo}
                  onChange={(e) => setFDesc((p) => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej: almuerzo, clase de yoga..."
                  className={inputCls + " placeholder:text-slate-600"}
                />
              </div>
              <button
                onClick={() => addFranja("NEGATIVA", fDesc.dia, fDesc.apertura, fDesc.cierre, fDesc.motivo)}
                disabled={pending}
                className="mt-3 w-full bg-orange-700 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-semibold transition"
              >
                {pending ? "Guardando..." : "Agregar descanso recurrente"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Bloqueos puntuales ── */}
        {tab === "bloqueos" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              {bloqueos.length === 0 && (
                <p className="text-sm text-slate-600 italic">Sin bloqueos próximos.</p>
              )}
              {bloqueos.map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-300">
                    <span className="font-semibold text-slate-200 font-mono">{b.fecha}</span>
                    <span className="ml-2 text-red-400">
                      {b.todoElDia ? "Todo el día" : `${b.horaInicio} – ${b.horaFin}`}
                    </span>
                    {b.motivo && <span className="text-slate-500 ml-2 text-xs">({b.motivo})</span>}
                  </span>
                  <button
                    onClick={() => delBloqueo(b.id)}
                    disabled={pending}
                    className="text-slate-600 hover:text-red-400 transition text-xl leading-none px-1"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Bloquear agenda por día / horario
              </p>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className={labelCls}>Fecha</label>
                  <input
                    type="date"
                    value={fBloqueo.fecha}
                    onChange={(e) => setFBloqueo((p) => ({ ...p, fecha: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div className="pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fBloqueo.todoElDia}
                      onChange={(e) => setFBloqueo((p) => ({ ...p, todoElDia: e.target.checked }))}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm text-slate-300">Todo el día</span>
                  </label>
                </div>
              </div>

              {!fBloqueo.todoElDia && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className={labelCls}>Desde</label>
                    <input
                      type="time"
                      value={fBloqueo.horaInicio}
                      onChange={(e) => setFBloqueo((p) => ({ ...p, horaInicio: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hasta</label>
                    <input
                      type="time"
                      value={fBloqueo.horaFin}
                      onChange={(e) => setFBloqueo((p) => ({ ...p, horaFin: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              <div className="mt-3">
                <label className={labelCls}>Motivo (opcional)</label>
                <input
                  type="text"
                  value={fBloqueo.motivo}
                  onChange={(e) => setFBloqueo((p) => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej: feriado, vacaciones, evento..."
                  className={inputCls + " placeholder:text-slate-600"}
                />
              </div>

              <button
                onClick={addBloqueo}
                disabled={pending || !fBloqueo.fecha}
                className="mt-3 w-full bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-semibold transition"
              >
                {pending ? "Guardando..." : "Bloquear agenda"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
