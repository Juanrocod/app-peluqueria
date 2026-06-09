"use client";

import { useState } from "react";
import { crearBloqueo } from "@/actions/bloqueos";

export default function FormularioBloqueo() {
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const form = e.currentTarget;
    const fechaStr = (form.elements.namedItem("fecha") as HTMLInputElement).value;
    const [y, m, d] = fechaStr.split("-").map(Number);
    await crearBloqueo({
      fecha: new Date(y, m - 1, d),
      horaInicio: (form.elements.namedItem("horaInicio") as HTMLInputElement).value,
      horaFin: (form.elements.namedItem("horaFin") as HTMLInputElement).value,
      motivo: (form.elements.namedItem("motivo") as HTMLInputElement).value || undefined,
    });
    form.reset();
    setEnviando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input name="fecha" type="date" required className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input name="horaInicio" type="time" defaultValue="00:00" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input name="horaFin" type="time" defaultValue="23:59" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
        <input name="motivo" type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Feriado, vacaciones..." />
      </div>
      <button type="submit" disabled={enviando} className="bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50">
        {enviando ? "Guardando..." : "Agregar bloqueo"}
      </button>
    </form>
  );
}
