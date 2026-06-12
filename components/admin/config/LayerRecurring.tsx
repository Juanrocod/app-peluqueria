"use client";

import { useState, useTransition } from "react";
import { crearFranjaAdmin, eliminarFranjaAdmin } from "@/actions/horarios";

const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];
const NOMBRES_DIA  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

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
  motivo?: string | null;
};

const inputCls =
  "w-full rounded-lg border border-ap-border bg-ap-bg px-2 py-2 text-sm text-ap-text focus:border-ap-primary focus:outline-none";

export default function LayerRecurring({ horarios }: { horarios: HorarioRow[] }) {
  const negativas = horarios.filter((h) => h.tipoFranja === "NEGATIVA");

  const [form, setForm] = useState({ dia: "1", desde: "12:00", hasta: "13:00", motivo: "" });
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      await crearFranjaAdmin({
        diaSemana: parseInt(form.dia),
        horaApertura: form.desde,
        horaCierre: form.hasta,
        tipoFranja: "NEGATIVA",
        motivo: form.motivo || undefined,
      });
      setForm((p) => ({ ...p, motivo: "" }));
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
          negativas
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
                    className="font-mono text-sm text-red-400"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {h.horaApertura} – {h.horaCierre}
                  </span>
                  {h.motivo && (
                    <span className="text-xs text-ap-muted">({h.motivo})</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(h.id)}
                  disabled={pending}
                  aria-label="Eliminar bloque recurrente"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ap-muted transition hover:bg-red-900/40 hover:text-red-400 disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
            ))
        )}
        {negativas.length === 0 && (
          <p className="py-2 text-sm italic text-ap-muted">Sin bloques recurrentes.</p>
        )}
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-ap-border bg-ap-bg p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ap-muted">
          Agregar bloque recurrente
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Día</label>
            <select
              value={form.dia}
              onChange={(e) => setForm((p) => ({ ...p, dia: e.target.value }))}
              className={inputCls}
            >
              {ORDEN_SEMANA.map((d) => <option key={d} value={d}>{NOMBRES_DIA[d]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Desde</label>
            <select
              value={form.desde}
              onChange={(e) => setForm((p) => ({ ...p, desde: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ap-muted">Hasta</label>
            <select
              value={form.hasta}
              onChange={(e) => setForm((p) => ({ ...p, hasta: e.target.value }))}
              className={inputCls}
            >
              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs text-ap-muted">Motivo (opcional)</label>
          <input
            type="text"
            value={form.motivo}
            onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))}
            placeholder="Ej: almuerzo, clase de yoga..."
            className={inputCls + " placeholder:text-ap-muted/50"}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={pending || form.desde >= form.hasta}
          className="mt-3 w-full rounded-lg bg-red-800 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
        >
          {pending ? "Guardando..." : "Agregar bloque recurrente"}
        </button>
      </div>
    </div>
  );
}
