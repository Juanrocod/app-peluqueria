export const revalidate = 60;
import { prisma } from "@/lib/prisma";
import { AgendaScreen } from "@/components/mobile/agenda/AgendaScreen";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export default async function AdminDashboard() {
  const hoy = new Date();

  const [turnosMes, turnosAnio] = await Promise.all([
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
