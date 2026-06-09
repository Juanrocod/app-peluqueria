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
          className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition"
        >
          Confirmar
        </button>
      )}
      {(estadoActual === "PENDIENTE" || estadoActual === "CONFIRMADO") && (
        <>
          <button
            onClick={() => cambiarEstado("COMPLETADO")}
            className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Completado
          </button>
          <button
            onClick={() => cambiarEstado("CANCELADO")}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}
