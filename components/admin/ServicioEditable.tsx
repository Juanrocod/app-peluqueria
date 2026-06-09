"use client";

import { useState } from "react";
import { actualizarServicio, eliminarServicio } from "@/actions/servicios";

type Servicio = {
  id: string;
  nombre: string;
  duracion: number;
  precio: string | number;
};

export default function ServicioEditable({ servicio }: { servicio: Servicio }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(servicio.nombre);
  const [duracion, setDuracion] = useState(servicio.duracion);
  const [precio, setPrecio] = useState(Number(servicio.precio));
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    setGuardando(true);
    await actualizarServicio(servicio.id, { nombre, duracion, precio });
    setEditando(false);
    setGuardando(false);
  }

  async function handleEliminar() {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await eliminarServicio(servicio.id);
  }

  if (editando) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex flex-col gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-full"
          placeholder="Nombre"
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Duración (min)</label>
            <input
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm w-full"
              min={5}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Precio ($)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm w-full"
              min={0}
              step="0.01"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setEditando(false)}
            className="text-sm text-gray-500 hover:underline px-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border px-4 py-3 flex items-center justify-between">
      <div>
        <div className="font-medium">{nombre}</div>
        <div className="text-sm text-gray-500">
          {duracion} min — ${Number(precio).toLocaleString("es-AR")}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setEditando(true)}
          className="text-blue-600 text-sm hover:underline"
        >
          Editar
        </button>
        <button
          onClick={handleEliminar}
          className="text-red-500 text-sm hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
