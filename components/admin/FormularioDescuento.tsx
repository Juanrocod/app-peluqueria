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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
      {codigoActivo ? (
        <div className="bg-green-950/50 border border-green-800 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-green-400 font-medium uppercase tracking-wide">Código activo</div>
            <div className="text-2xl font-bold font-mono text-green-200 mt-0.5">{codigoActivo.codigo}</div>
            <div className="text-sm text-green-300">{codigoActivo.descuento}% de descuento</div>
          </div>
          <button onClick={handleDesactivar} className="text-xs text-red-500 hover:text-red-400">
            Desactivar
          </button>
        </div>
      ) : (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-500">Sin código activo</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Nuevo código (5 caracteres)</label>
          <div className="flex gap-2">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().slice(0, 5))}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase tracking-widest placeholder:text-zinc-500"
              placeholder="XXXXX"
              maxLength={5}
            />
            <button type="button" onClick={generarCodigo} className="px-3 py-2 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 transition">
              Generar
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Porcentaje de descuento</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
              min={1}
              max={100}
              className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100"
            />
            <span className="text-zinc-400 text-sm">%</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={guardando || codigo.length !== 5}
          className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {guardando ? "Activando..." : "Activar nuevo código"}
        </button>
      </form>
    </div>
  );
}
