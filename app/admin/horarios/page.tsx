export const revalidate = 120;
import { prisma } from "@/lib/prisma";
import { format, startOfToday } from "date-fns";
import { HorariosMobile } from "@/components/mobile/config/HorariosMobile";

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

  const horariosData = horarios.map((h) => ({
    id: h.id,
    diaSemana: h.diaSemana,
    horaApertura: h.horaApertura,
    horaCierre: h.horaCierre,
    tipoFranja: h.tipoFranja,
    motivo: h.motivo,
    etiqueta: h.etiqueta,
    recargo: h.recargo,
  }));

  const bloqueosData = bloqueos.map((b) => ({
    id: b.id,
    fecha: format(b.fecha, "yyyy-MM-dd"),
    horaInicio: b.horaInicio,
    horaFin: b.horaFin,
    todoElDia: b.todoElDia,
    motivo: b.motivo,
  }));

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <HorariosMobile horarios={horariosData} bloqueos={bloqueosData} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <HorariosMobile horarios={horariosData} bloqueos={bloqueosData} />
      </div>
    </>
  );
}
