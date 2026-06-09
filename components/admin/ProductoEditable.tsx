"use client";

import { useState } from "react";
import { actualizarProducto, eliminarProducto } from "@/actions/catalogo";

type Producto = { id: string; nombre: string; descripcion: string; precio: number; ganancia: number | null; imagenUrl: string };

export default function ProductoEditable({ producto }: { producto: Producto }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(producto.nombre);
  const [descripcion, setDescripcion] = useState(producto.descripcion);
  const [precio, setPrecio] = useState(producto.precio);
  const [ganancia, setGanancia] = useState<number | "">(producto.ganancia ?? "");
  const [imagenUrl, setImagenUrl] = useState(producto.imagenUrl);
  const [guardando, setGuardando] = useState(false);

  async function handleGuardar() {
    setGuardando(true);
    await actualizarProducto(producto.id, {
      nombre,
      descripcion,
      precio,
      ganancia: ganancia !== "" ? ganancia : undefined,
      imagenUrl,
    });
    setEditando(false);
    setGuardando(false);
  }

  async function handleEliminar() {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    await eliminarProducto(producto.id);
  }

  if (editando) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition"
            placeholder="Nombre"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Descripción</label>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition"
            placeholder="Descripción"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Precio de venta ($)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition"
              min={0}
              step="0.01"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Tu ganancia ($)</label>
            <input
              type="number"
              value={ganancia}
              onChange={(e) => setGanancia(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition"
              min={0}
              step="0.01"
              placeholder="Opcional"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">URL de imagen</label>
          <input
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition"
            placeholder="URL de imagen"
          />
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex gap-4 items-start shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition">
      {imagenUrl ? (
        <img src={imagenUrl} alt={nombre} className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-zinc-100 dark:border-zinc-800" />
      ) : (
        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 dark:text-zinc-700 flex-shrink-0 text-2xl select-none">📦</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-zinc-900 dark:text-zinc-50">{nombre}</div>
        {descripcion && <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{descripcion}</div>}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Venta: ${Number(precio).toLocaleString("es-AR")}</span>
          {ganancia !== null && ganancia !== "" && (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Ganancia: ${Number(ganancia).toLocaleString("es-AR")}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => setEditando(true)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition cursor-pointer"
        >
          Editar
        </button>
        <button
          onClick={handleEliminar}
          className="text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium transition cursor-pointer"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
