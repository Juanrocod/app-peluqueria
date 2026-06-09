"use client";

import { useState } from "react";
import { crearFranja } from "@/actions/horarios";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function FormularioHorario({ tipo }: { tipo: "positiva" | "negativa" }) {
  const [especial, setEspecial] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const form = e.currentTarget;
    await crearFranja({
      diaSemana: Number((form.elements.namedItem("diaSemana") as HTMLSelectElement).value),
      horaApertura: (form.elements.namedItem("horaApertura") as HTMLInputElement).value,
      horaCierre: (form.elements.namedItem("horaCierre") as HTMLInputElement).value,
      etiqueta: especial ? "especial" : undefined,
      esBloqueo: tipo === "negativa",
    });
    form.reset();
    setEspecial(false);
    setEnviando(false);
  }

  const accentClass = tipo === "negativa" ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700";

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Día</label>
        <select name="diaSemana" className="w-full border rounded-lg px-3 py-2 text-sm">
          {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input name="horaApertura" type="time" defaultValue={tipo === "negativa" ? "12:00" : "09:00"} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input name="horaCierre" type="time" defaultValue={tipo === "negativa" ? "13:00" : "17:00"} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      {tipo === "positiva" && (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={especial} onChange={(e) => setEspecial(e.target.checked)} className="rounded" />
          Turno especial nocturno
        </label>
      )}
      <button type="submit" disabled={enviando} className={`text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${accentClass}`}>
        {enviando ? "Guardando..." : tipo === "negativa" ? "Agregar bloqueo recurrente" : "Agregar franja"}
      </button>
    </form>
  );
}
