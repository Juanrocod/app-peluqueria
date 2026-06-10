"use client";

import { useState, useTransition } from "react";
import { crearFranjaAdmin, eliminarFranjaAdmin } from "@/actions/horarios";

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const NOMBRES_DIA  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

// 07:00 a 23:00 en intervalos de 30 min
const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2,"0")}:${m}`;
});

type HorarioRow = {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
};

const inputCls =
  "w-full rounded-lg border border-ap-border bg-ap-bg px-2 py-2 text-sm text-ap-text focus:border-ap-primary focus:outline-none";

export default function LayerBaseHours({ horarios }: { horarios: HorarioRow[] }) {
  const positivas = horarios.filter((h) => h.tipoFranja === "POSITIVA");

  const [form, setForm] = useState({ dia: "1", apertura: "09:00", cierre: "18:00" });
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await crearFranjaAdmin({
        diaSemana: parseInt(form.dia),
        horaApertura: form.apertura,
        horaCierre: form.cierre,
        tipoFranja: "POSITIVA",
      });
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => { await eliminarFranjaAdmin(id); });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Lista actual */}
      <div className="flex flex-col gap-1.5">
        {ORDEN_SEMANA.flatMap((dia) =>
          positivas
            .filter((h) => h.diaSemana === dia)
            .map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg border border-ap-border bg-ap-bg px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-sm font-semibold text-ap-accent">
                    {NOMBRES_DIA[h.diaSemana]}
                  </span>
                  <span
                    className="font-mono text-sm text-emerald-400"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {h.horaApertura} – {h.horaCierre}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(h.id)}
                  disabled={pending}
                  aria-label={`Eliminar horario ${NOMBRES_DIA[h.diaSemana]}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted transition hover:bg-red-900/40 hover:text-red-400 disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            ))
        )}
        {positivas.length === 0 && (
          <p className="py-2 text-sm italic text-ap-muted">Sin horario base configurado.</p>
        )}
      </div>

      {/* Formulario de alta */}
      <div className="rounded-xl border border-ap-border bg-ap-bg p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ap-muted">
          Agregar ventana de atención
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Día</label>
            <select
              value={form.dia}
              onChange={(e) => setForm((p) => ({ ...p, dia: e.target.value }))}
              className={inputCls}
            >
              {ORDEN_SEMANA.map((d) => (
                <option key={d} value={d}>{NOMBRES_DIA[d]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Apertura</label>
            <select
              value={form.apertura}
              onChange={(e) => setForm((p) => ({ ...p, apertura: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Cierre</label>
            <select
              value={form.cierre}
              onChange={(e) => setForm((p) => ({ ...p, cierre: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={pending || form.apertura >= form.cierre}
          className="mt-3 w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
        >
          {pending ? "Guardando..." : "Agregar horario base"}
        </button>
      </div>
    </div>
  );
}
