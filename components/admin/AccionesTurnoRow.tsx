"use client";

import { actualizarEstadoTurno } from "@/actions/turnos";
import type { EstadoTurno } from "@prisma/client";

export default function AccionesTurnoRow({
  turnoId,
  estadoActual,
}: {
  turnoId: string;
  estadoActual: EstadoTurno;
}) {
  async function cambiarEstado(estado: EstadoTurno) {
    await actualizarEstadoTurno(turnoId, estado);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {estadoActual === "PENDIENTE" && (
        <button
          onClick={() => cambiarEstado("CONFIRMADO")}
          className="text-xs px-2 py-1 rounded bg-green-900/50 text-green-400 hover:bg-green-900 transition"
        >
          Confirmar
        </button>
      )}
      {(estadoActual === "PENDIENTE" || estadoActual === "CONFIRMADO") && (
        <>
          <button
            onClick={() => cambiarEstado("COMPLETADO")}
            className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            Completado
          </button>
          <button
            onClick={() => cambiarEstado("CANCELADO")}
            className="text-xs px-2 py-1 rounded bg-red-900/50 text-red-400 hover:bg-red-900/70 transition"
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}
