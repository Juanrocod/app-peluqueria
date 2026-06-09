"use client";

import { useState } from "react";
import { setConfiguracion } from "@/actions/configuracion";

export default function FormularioMarca({
  nombreInicial,
  descripcionInicial,
  imagenUrlInicial,
}: {
  nombreInicial: string;
  descripcionInicial: string;
  imagenUrlInicial: string;
}) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [imagenUrl, setImagenUrl] = useState(imagenUrlInicial);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await setConfiguracion("marca_nombre", nombre);
    await setConfiguracion("marca_descripcion", descripcion);
    await setConfiguracion("marca_imagen_fondo", imagenUrl);
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-4 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nombre de tu peluquería</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-500" placeholder="Ej: Peluquería Style" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Descripción / slogan</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-500" placeholder="Ej: Tu imagen, nuestra pasión. Cortate como te mereces." />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Imagen de fondo (URL)</label>
        <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-500" placeholder="https://... (dejá vacío para usar el fondo por defecto)" />
        {imagenUrl && (
          <div className="mt-3 h-24 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <button type="submit" disabled={guardando} className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white py-2.5 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 cursor-pointer shadow-xs disabled:opacity-50">
        {guardado ? "¡Guardado!" : guardando ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
