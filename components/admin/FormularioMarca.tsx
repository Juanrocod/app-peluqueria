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
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre de tu peluquería</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500" placeholder="Ej: Peluquería Style" />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Descripción / slogan</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 resize-none" placeholder="Ej: Tu imagen, nuestra pasión. Cortate como te mereces." />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Imagen de fondo (URL)</label>
        <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500" placeholder="https://... (dejá vacío para usar el fondo por defecto)" />
        {imagenUrl && (
          <div className="mt-2 h-24 rounded-lg overflow-hidden border border-zinc-700">
            <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <button type="submit" disabled={guardando} className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
        {guardado ? "¡Guardado!" : guardando ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
