export const revalidate = 60;
import { prisma } from "@/lib/prisma";
import CalendarioAdmin from "@/components/admin/CalendarioAdmin";
import { AgendaScreen } from "@/components/mobile/agenda/AgendaScreen";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from "date-fns";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const params = await searchParams;
  const hoy = new Date();

  // Desktop weekly calendar
  let desde: Date;
  if (params.semana) {
    const [y, m, d] = params.semana.split("-").map(Number);
    desde = new Date(y, m - 1, d);
  } else {
    desde = startOfWeek(hoy, { weekStartsOn: 1 });
  }
  const hasta = endOfWeek(desde, { weekStartsOn: 1 });

  const [turnosSemana, turnosMes, turnosAnio] = await Promise.all([
    // Para CalendarioAdmin (desktop weekly, mantenido como fallback)
    prisma.turno.findMany({
      where: {
        fechaHora: { gte: desde, lte: hasta },
        estado: { notIn: ["CANCELADO", "COMPLETADO"] },
      },
      include: { servicio: true, peluquero: true },
      orderBy: { fechaHora: "asc" },
    }),
    // Para AgendaScreen mobile (mes actual, dot indicators)
    prisma.turno.findMany({
      where: {
        fechaHora: { gte: startOfMonth(hoy), lte: endOfMonth(hoy) },
        estado: { notIn: ["CANCELADO"] },
      },
      include: { servicio: { select: { nombre: true, duracion: true } } },
    }),
    // Para AgendaScreen desktop (año completo, navegación por mes)
    prisma.turno.findMany({
      where: {
        fechaHora: { gte: startOfYear(hoy), lte: endOfYear(hoy) },
        estado: { notIn: ["CANCELADO"] },
      },
      include: { servicio: { select: { nombre: true, duracion: true } } },
    }),
  ]);

  const semanaDesdeISO = format(desde, "yyyy-MM-dd");
  const hoyISO = format(hoy, "yyyy-MM-dd");

  const serializedTurnos = turnosMes.map((t) => ({
    fechaHora: t.fechaHora.toISOString(),
    servicioNombre: t.servicio.nombre,
    clienteNombre: t.clienteNombre,
    duracion: t.servicio.duracion,
  }));

  const serializedTurnosAnio = turnosAnio.map((t) => ({
    fechaHora: t.fechaHora.toISOString(),
    servicioNombre: t.servicio.nombre,
    clienteNombre: t.clienteNombre,
    duracion: t.servicio.duracion,
  }));

  return (
    <div>
      {/* Desktop: AgendaScreen con datos de año completo */}
      <div className="hidden md:block">
        <AgendaScreen turnos={serializedTurnosAnio} />
      </div>

      {/* Mobile: agenda con mes actual */}
      <div className="md:hidden flex flex-1 flex-col min-h-[calc(100dvh-120px)]">
        <PullToRefresh>
          <AgendaScreen turnos={serializedTurnos} />
        </PullToRefresh>
      </div>
    </div>
  );
}
