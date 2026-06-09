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
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            placeholder="Nombre"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Duración (min)</label>
            <input
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(Number(e.target.value))}
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              min={5}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Precio ($)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              min={0}
              step="0.01"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => setEditando(false)}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium px-3 py-1.5 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white text-sm px-4 py-1.5 rounded-lg font-medium shadow-xs transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 cursor-pointer"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
      <div>
        <div className="font-medium text-zinc-900 dark:text-zinc-50">{nombre}</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {duracion} min — ${Number(precio).toLocaleString("es-AR")}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setEditando(true)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm font-medium transition cursor-pointer"
        >
          Editar
        </button>
        <button
          onClick={handleEliminar}
          className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 text-sm font-medium transition cursor-pointer"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
