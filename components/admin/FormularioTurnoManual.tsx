"use client";

import { useState } from "react";
import { crearTurno } from "@/actions/turnos";
import { useRouter } from "next/navigation";
import type { Servicio, Peluquero } from "@prisma/client";

export default function FormularioTurnoManual({
  servicios,
  peluqueros,
}: {
  servicios: Servicio[];
  peluqueros: Peluquero[];
}) {
  const router = useRouter();
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [hora, setHora] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cargarSlots(fechaISO: string, svcId: string) {
    if (!svcId || !fechaISO) return;
    const res = await fetch(`/api/disponibilidad?fecha=${fechaISO}&servicioId=${svcId}`);
    const data = await res.json();
    setSlots(data.slots ?? []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    const form = e.currentTarget;
    const nombre = (form.elements.namedItem("nombre") as HTMLInputElement).value;
    const telefono = (form.elements.namedItem("telefono") as HTMLInputElement).value;
    const peluqueroId = (form.elements.namedItem("peluqueroId") as HTMLSelectElement).value || undefined;
    const notas = (form.elements.namedItem("notas") as HTMLTextAreaElement).value || undefined;

    const [anio, mes, dia] = fecha.split("-").map(Number);
    const [h, m] = hora.split(":").map(Number);
    const fechaHora = new Date(anio, mes - 1, dia, h, m);

    await crearTurno({ fechaHora, clienteNombre: nombre, clienteTelefono: telefono, servicioId, peluqueroId, notas, origen: "MANUAL" });
    router.push("/admin/turnos");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Servicio</label>
        <select
          name="servicioId"
          required
          value={servicioId}
          onChange={(e) => {
            setServicioId(e.target.value);
            if (fecha) cargarSlots(fecha, e.target.value);
          }}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Seleccionar...</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre} ({s.duracion} min)</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            if (servicioId) cargarSlots(e.target.value, servicioId);
          }}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {slots.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Horario</label>
          <div className="grid grid-cols-5 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setHora(s)}
                className={`border rounded-lg py-1 text-sm transition ${hora === s ? "border-blue-500 bg-blue-50 text-blue-700" : "hover:border-gray-400"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">O ingresá una hora manual</label>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="border rounded-lg px-3 py-1 text-sm" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del cliente</label>
        <input name="nombre" type="text" required className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Teléfono</label>
        <input name="telefono" type="tel" required className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Peluquero (opcional)</label>
        <select name="peluqueroId" className="w-full border rounded-lg px-3 py-2 text-sm">
          <option value="">Sin asignar</option>
          {peluqueros.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
        <textarea name="notas" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={!servicioId || !fecha || !hora || enviando}
        className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {enviando ? "Guardando..." : "Guardar turno"}
      </button>
    </form>
  );
}
