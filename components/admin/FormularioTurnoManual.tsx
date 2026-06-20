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
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [peluqueroId, setPeluqueroId] = useState("");
  const [notas, setNotas] = useState("");

  const inputClass =
    "w-full rounded-xl border border-ap-border bg-ap-s1 px-3.5 py-3 text-[15px] text-ap-text placeholder-ap-muted outline-none transition-all focus:border-ap-primary focus:ring-[3px] focus:ring-[rgba(47,107,255,.18)]";

  async function cargarSlots(fechaISO: string, svcId: string) {
    if (!svcId || !fechaISO) return;
    try {
      const res = await fetch(`/api/disponibilidad?fecha=${fechaISO}&servicioId=${svcId}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError("");

    try {
      const [anio, mes, dia] = fecha.split("-").map(Number);
      const [h, m] = hora.split(":").map(Number);
      const fechaHora = new Date(anio, mes - 1, dia, h, m);

      await crearTurno({
        fechaHora,
        clienteNombre: nombre,
        clienteTelefono: telefono,
        servicioId,
        peluqueroId: peluqueroId || undefined,
        notas: notas || undefined,
        origen: "MANUAL",
      });
      router.push("/admin/turnos");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar el turno";
      setError(msg);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Servicio
        </label>
        <select
          required
          value={servicioId}
          onChange={(e) => {
            setServicioId(e.target.value);
            if (fecha) cargarSlots(fecha, e.target.value);
          }}
          className={inputClass}
        >
          <option value="">Seleccionar...</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} ({s.duracion} min)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Fecha
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            if (servicioId) cargarSlots(e.target.value, servicioId);
          }}
          className={inputClass}
        />
      </div>

      {slots.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
            Horario
          </label>
          <div className="grid grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setHora(s)}
                className="rounded-xl border py-2.5 font-mono-num text-sm font-semibold transition-all"
                style={{
                  background: hora === s ? "linear-gradient(135deg, #3B6EF5, #8B5CF6)" : "var(--color-ap-s1)",
                  borderColor: hora === s ? "transparent" : "var(--color-ap-border)",
                  color: hora === s ? "#fff" : "var(--color-ap-text)",
                  boxShadow: hora === s ? "0 4px 12px -3px rgba(47,107,255,.4)" : "none",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-2.5">
            <label className="mb-1 block text-[11px] text-ap-muted">O ingresá una hora manual</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className={`${inputClass} w-auto`}
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Nombre del cliente
        </label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre completo"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Teléfono
        </label>
        <input
          type="tel"
          required
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="11 2345 6789"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Peluquero (opcional)
        </label>
        <select
          value={peluqueroId}
          onChange={(e) => setPeluqueroId(e.target.value)}
          className={inputClass}
        >
          <option value="">Sin asignar</option>
          {peluqueros.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ap-sub">
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Observaciones..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-ap-danger/30 bg-ap-danger/10 px-4 py-3 text-sm text-ap-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!servicioId || !fecha || !hora || !nombre || !telefono || enviando}
        className="rounded-xl bg-ap-primary py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-ap-primary-dk disabled:opacity-50"
      >
        {enviando ? "Guardando..." : "Guardar turno"}
      </button>
    </form>
  );
}
