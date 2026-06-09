"use client";

import { useRef, useState } from "react";
import { crearProducto } from "@/actions/catalogo";

export default function FormularioProducto() {
  const formRef = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const form = e.currentTarget;
    await crearProducto({
      nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value,
      descripcion: (form.elements.namedItem("descripcion") as HTMLInputElement).value || undefined,
      precio: Number((form.elements.namedItem("precio") as HTMLInputElement).value),
      ganancia: Number((form.elements.namedItem("ganancia") as HTMLInputElement).value) || undefined,
      imagenUrl: (form.elements.namedItem("imagenUrl") as HTMLInputElement).value || undefined,
    });
    formRef.current?.reset();
    setEnviando(false);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-4 shadow-sm"
    >
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Nombre del producto
        </label>
        <input
          name="nombre"
          type="text"
          required
          className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-605"
          placeholder="Ej: Pomada fijadora"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Descripción (opcional)
        </label>
        <input
          name="descripcion"
          type="text"
          className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-605"
          placeholder="Breve descripción del producto"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Precio de venta ($)
          </label>
          <input
            name="precio"
            type="number"
            min={0}
            step="0.01"
            required
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-605"
            placeholder="Lo que ve el cliente"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Tu ganancia ($)
          </label>
          <input
            name="ganancia"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-605"
            placeholder="Tu margen real"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          URL de imagen (opcional)
        </label>
        <input
          name="imagenUrl"
          type="url"
          className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-zinc-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-605"
          placeholder="https://..."
        />
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white py-2.5 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 cursor-pointer shadow-xs disabled:opacity-50"
      >
        {enviando ? "Guardando..." : "Agregar producto"}
      </button>
    </form>
  );
}
