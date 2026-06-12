"use client";

import { crearServicio } from "@/actions/servicios";
import { useRef } from "react";

export default function FormularioServicio() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await crearServicio({
      nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value,
      duracion: Number((form.elements.namedItem("duracion") as HTMLInputElement).value),
      precio: Number((form.elements.namedItem("precio") as HTMLInputElement).value),
    });
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre del servicio</label>
        <input name="nombre" type="text" required className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Duración (min)</label>
          <input name="duracion" type="number" min={5} required className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Precio ($)</label>
          <input name="precio" type="number" min={0} step="0.01" required className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
        </div>
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
        Agregar
      </button>
    </form>
  );
}
