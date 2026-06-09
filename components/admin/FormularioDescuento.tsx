"use client";

import { useState } from "react";
import { crearCodigo, desactivarCodigo } from "@/actions/configuracion";

type CodigoActivo = { id: string; codigo: string; descuento: number } | null;

export default function FormularioDescuento({ codigoActivo }: { codigoActivo: CodigoActivo }) {
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState(10);
  const [guardando, setGuardando] = useState(false);

  function generarCodigo() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    setCodigo(Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.length !== 5) return;
    setGuardando(true);
    await crearCodigo(codigo, descuento);
    setCodigo("");
    setGuardando(false);
  }

  async function handleDesactivar() {
    if (!confirm("¿Desactivar el código actual?")) return;
    await desactivarCodigo();
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
      {codigoActivo ? (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wide">Código activo</div>
            <div className="text-2xl font-bold font-mono text-green-800 dark:text-green-100 mt-0.5">{codigoActivo.codigo}</div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-0.5">{codigoActivo.descuento}% de descuento</div>
          </div>
          <button onClick={handleDesactivar} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition cursor-pointer">
            Desactivar
          </button>
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500 italic text-center">
          Sin código activo
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nuevo código (5 caracteres)</label>
          <div className="flex gap-2">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().slice(0, 5))}
              className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              placeholder="XXXXX"
              maxLength={5}
            />
            <button type="button" onClick={generarCodigo} className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-sm transition font-medium cursor-pointer">
              Generar
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Porcentaje de descuento</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
              min={1}
              max={100}
              className="w-24 border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            />
            <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">%</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={guardando || codigo.length !== 5}
          className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white py-2.5 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {guardando ? "Activando..." : "Activar nuevo código"}
        </button>
      </form>
    </div>
  );
}
