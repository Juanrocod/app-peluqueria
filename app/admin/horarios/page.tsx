import { prisma } from "@/lib/prisma";
import { format, startOfToday } from "date-fns";
import ConfigPageClient from "@/components/admin/config/ConfigPageClient";

export default async function HorariosPage() {
  const hoy    = startOfToday();
  const hoyUTC = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));

  const [horarios, bloqueos] = await Promise.all([
    prisma.horarioAtencion.findMany({
      where: { activo: true },
      orderBy: [{ diaSemana: "asc" }, { horaApertura: "asc" }],
    }),
    prisma.bloqueoHorario.findMany({
      where: { fecha: { gte: hoyUTC } },
      orderBy: { fecha: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="border-b border-ap-border bg-ap-s2 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ap-accent">
          Config
        </p>
        <h1 className="mt-0.5 text-xl font-bold text-ap-text">Horarios de atención</h1>
        <p className="mt-0.5 text-sm text-ap-sub">
          Configurá tu disponibilidad semanal en 3 capas.
        </p>
      </div>

      {/* Accordion */}
      <div className="overflow-auto px-4 py-4">
        <ConfigPageClient
          horarios={horarios.map((h) => ({
            id: h.id,
            diaSemana: h.diaSemana,
            horaApertura: h.horaApertura,
            horaCierre: h.horaCierre,
            tipoFranja: h.tipoFranja,
            motivo: h.motivo,
          }))}
          bloqueos={bloqueos.map((b) => ({
            id: b.id,
            fecha: format(b.fecha, "yyyy-MM-dd"),
            horaInicio: b.horaInicio,
            horaFin: b.horaFin,
            todoElDia: b.todoElDia,
            motivo: b.motivo,
          }))}
        />
      </div>
    </div>
  );
}
