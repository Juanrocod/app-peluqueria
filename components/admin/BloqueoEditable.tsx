"use client";

import { useState } from "react";
import { actualizarBloqueo, eliminarBloqueo } from "@/actions/bloqueos";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Bloqueo = {
  id: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  motivo: string | null;
};

export default function BloqueoEditable({ bloqueo }: { bloqueo: Bloqueo }) {
  const [editando, setEditando] = useState(false);
  const [fecha, setFecha] = useState(format(bloqueo.fecha, "yyyy-MM-dd"));
  const [horaInicio, setHoraInicio] = useState(bloqueo.horaInicio);
  const [horaFin, setHoraFin] = useState(bloqueo.horaFin);
  const [motivo, setMotivo] = useState(bloqueo.motivo ?? "");
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    setGuardando(true);
    const [y, m, d] = fecha.split("-").map(Number);
    await actualizarBloqueo(bloqueo.id, {
      fecha: new Date(y, m - 1, d),
      horaInicio,
      horaFin,
      motivo: motivo || undefined,
    });
    setEditando(false);
    setGuardando(false);
  }

  async function handleEliminar() {
    if (!confirm("¿Eliminar este bloqueo?")) return;
    await eliminarBloqueo(bloqueo.id);
  }

  if (editando) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 flex flex-col gap-2">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        <div className="flex gap-2 items-center">
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          <span className="text-gray-400">–</span>
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        </div>
        <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (opcional)" className="border rounded px-2 py-1 text-sm" />
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
    <div className="bg-white border rounded-lg px-4 py-3 flex items-center justify-between gap-2">
      <div>
        <div className="font-medium text-sm capitalize">
          {format(bloqueo.fecha, "EEEE d/MM", { locale: es })}
        </div>
        <div className="text-xs text-gray-500">
          {bloqueo.horaInicio} – {bloqueo.horaFin}
          {bloqueo.motivo && ` · ${bloqueo.motivo}`}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setEditando(true)} className="text-xs text-blue-600 hover:underline">Editar</button>
        <button onClick={handleEliminar} className="text-xs text-red-500 hover:underline">Eliminar</button>
      </div>
    </div>
  );
}
