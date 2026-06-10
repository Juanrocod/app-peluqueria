import { prisma } from "@/lib/prisma";
import ScheduleGrid from "@/components/admin/schedule/ScheduleGrid";
import { startOfWeek, endOfWeek, format } from "date-fns";
import Link from "next/link";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const params = await searchParams;
  const hoy    = new Date();

  let desde: Date;
  if (params.semana) {
    const [y, m, d] = params.semana.split("-").map(Number);
    desde = new Date(y, m - 1, d);
  } else {
    desde = startOfWeek(hoy, { weekStartsOn: 1 });
  }
  const hasta = endOfWeek(desde, { weekStartsOn: 1 });

  const [turnos, horarios, bloqueos] = await Promise.all([
    prisma.turno.findMany({
      where: {
        fechaHora: { gte: desde, lte: hasta },
        estado: { notIn: ["CANCELADO", "COMPLETADO"] },
      },
      include: { servicio: true },
      orderBy: { fechaHora: "asc" },
    }),
    prisma.horarioAtencion.findMany({
      where: { activo: true },
      orderBy: [{ diaSemana: "asc" }, { horaApertura: "asc" }],
    }),
    prisma.bloqueoHorario.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      orderBy: { fecha: "asc" },
    }),
  ]);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:h-screen">
      {/* Header de página */}
      <div className="flex items-center justify-between border-b border-ap-border px-4 py-3">
        <h1 className="text-base font-semibold text-ap-text">Agenda</h1>
        <Link
          href="/admin/turnos/nuevo"
          className="rounded-lg bg-ap-cta px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          + Nuevo turno
        </Link>
      </div>

      <ScheduleGrid
        turnos={turnos}
        horarios={horarios.map((h) => ({
          diaSemana: h.diaSemana,
          horaApertura: h.horaApertura,
          horaCierre: h.horaCierre,
          tipoFranja: h.tipoFranja,
        }))}
        bloqueos={bloqueos.map((b) => ({
          fecha: format(b.fecha, "yyyy-MM-dd"),
          todoElDia: b.todoElDia,
          horaInicio: b.horaInicio,
          horaFin: b.horaFin,
        }))}
        semanaDesde={format(desde, "yyyy-MM-dd")}
        hoy={format(hoy, "yyyy-MM-dd")}
      />
    </div>
  );
}
