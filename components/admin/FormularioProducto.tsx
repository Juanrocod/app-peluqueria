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
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del producto</label>
        <input name="nombre" type="text" required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ej: Pomada fijadora" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
        <input name="descripcion" type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Breve descripción del producto" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Precio de venta ($)</label>
          <input name="precio" type="number" min={0} step="0.01" required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Lo que ve el cliente" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tu ganancia ($)</label>
          <input name="ganancia" type="number" min={0} step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tu margen real" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">URL de imagen (opcional)</label>
        <input name="imagenUrl" type="url" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
      </div>
      <button type="submit" disabled={enviando} className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
        {enviando ? "Guardando..." : "Agregar producto"}
      </button>
    </form>
  );
}
