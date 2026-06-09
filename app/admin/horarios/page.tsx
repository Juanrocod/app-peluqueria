import { prisma } from "@/lib/prisma";
import { format, startOfToday } from "date-fns";
import PanelHorarios from "@/components/admin/PanelHorarios";

export default async function HorariosPage() {
  const hoy = startOfToday();
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
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Horarios de atención</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configurá las ventanas de atención, descansos recurrentes y bloqueos puntuales de agenda.
        </p>
      </div>
      <PanelHorarios
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
  );
}
