"use client";

import { crearPeluquero } from "@/actions/peluqueros";
import { useRef } from "react";

export default function FormularioPeluquero() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await crearPeluquero({
      nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value,
    });
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Nombre</label>
        <input name="nombre" type="text" required className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100" />
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
        Agregar
      </button>
    </form>
  );
}
