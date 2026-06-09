"use client";

import { useState } from "react";
import { actualizarFranja, eliminarFranja, toggleFranja } from "@/actions/horarios";

type Franja = {
  id: string;
  horaApertura: string;
  horaCierre: string;
  etiqueta: string | null;
  esBloqueo: boolean;
  activo: boolean;
};

export default function HorarioFranjaEditable({ franja }: { franja: Franja }) {
  const [editando, setEditando] = useState(false);
  const [apertura, setApertura] = useState(franja.horaApertura);
  const [cierre, setCierre] = useState(franja.horaCierre);
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    setGuardando(true);
    await actualizarFranja(franja.id, { horaApertura: apertura, horaCierre: cierre });
    setEditando(false);
    setGuardando(false);
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar esta franja?")) return;
    await eliminarFranja(franja.id);
  }

  const borderColor = franja.esBloqueo ? "border-orange-100" : "border-gray-100";

  if (editando) {
    return (
      <div className={`border-b last:border-0 px-4 py-3 flex flex-col gap-2 bg-blue-50 ${borderColor}`}>
        <div className="flex gap-2 items-center">
          <input type="time" value={apertura} onChange={(e) => setApertura(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          <span className="text-gray-400">–</span>
          <input type="time" value={cierre} onChange={(e) => setCierre(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditando(false)} className="text-xs text-gray-500 hover:underline">Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-b last:border-0 px-4 py-3 flex items-center justify-between gap-2 ${borderColor}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{franja.horaApertura} – {franja.horaCierre}</span>
        {franja.etiqueta === "especial" && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Especial</span>
        )}
        {!franja.activo && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactivo</span>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <button onClick={() => setEditando(true)} className="text-xs text-blue-600 hover:underline">Editar</button>
        <button
          onClick={() => toggleFranja(franja.id, !franja.activo)}
          className={`text-xs px-2 py-1 rounded border transition ${franja.activo ? "border-green-400 text-green-600 hover:bg-green-50" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}
        >
          {franja.activo ? "Activo" : "Activar"}
        </button>
        <button onClick={handleEliminar} className="text-xs text-red-500 hover:underline">Eliminar</button>
      </div>
    </div>
  );
}
