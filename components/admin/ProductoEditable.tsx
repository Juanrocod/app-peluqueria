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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-2">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" placeholder="Nombre" />
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" placeholder="Descripción" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 mb-0.5 block">Precio de venta ($)</label>
            <input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} className="border rounded px-2 py-1 text-sm w-full" min={0} step="0.01" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-0.5 block">Tu ganancia ($)</label>
            <input type="number" value={ganancia} onChange={(e) => setGanancia(e.target.value === "" ? "" : Number(e.target.value))} className="border rounded px-2 py-1 text-sm w-full" min={0} step="0.01" placeholder="Opcional" />
          </div>
        </div>
        <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" placeholder="URL de imagen" />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setEditando(false)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando} className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-3 flex gap-3 items-start">
      {imagenUrl ? (
        <img src={imagenUrl} alt={nombre} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 flex-shrink-0 text-2xl">📦</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium">{nombre}</div>
        {descripcion && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{descripcion}</div>}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm font-semibold text-blue-700">Venta: ${Number(precio).toLocaleString("es-AR")}</span>
          {ganancia !== null && ganancia !== "" && (
            <span className="text-sm font-semibold text-green-700">Ganancia: ${Number(ganancia).toLocaleString("es-AR")}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button onClick={() => setEditando(true)} className="text-xs text-blue-600 hover:underline">Editar</button>
        <button onClick={handleEliminar} className="text-xs text-red-500 hover:underline">Eliminar</button>
      </div>
    </div>
  );
}
