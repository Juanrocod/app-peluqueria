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
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input name="nombre" type="text" required className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
        Agregar
      </button>
    </form>
  );
}
