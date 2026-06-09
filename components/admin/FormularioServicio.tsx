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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-4 shadow-sm"
    >
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Nombre del servicio
        </label>
        <input
          name="nombre"
          type="text"
          required
          className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          placeholder="Ej. Corte de cabello"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Duración (min)
          </label>
          <input
            name="duracion"
            type="number"
            min={5}
            required
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Precio ($)
          </label>
          <input
            name="precio"
            type="number"
            min={0}
            step="0.01"
            required
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            placeholder="1500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 cursor-pointer shadow-xs"
      >
        Agregar
      </button>
    </form>
  );
}
