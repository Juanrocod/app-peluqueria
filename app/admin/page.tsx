export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import CalendarioAdmin from "@/components/admin/CalendarioAdmin";
import { AgendaScreen } from "@/components/mobile/agenda/AgendaScreen";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const params = await searchParams;
  const hoy = new Date();

  // Calcular lunes de la semana solicitada (o semana actual)
  let desde: Date;
  if (params.semana) {
    const [y, m, d] = params.semana.split("-").map(Number);
    desde = new Date(y, m - 1, d);
  } else {
    desde = startOfWeek(hoy, { weekStartsOn: 1 });
  }
  const hasta = endOfWeek(desde, { weekStartsOn: 1 });

  const turnos = await prisma.turno.findMany({
    where: {
      fechaHora: { gte: desde, lte: hasta },
      estado: { notIn: ["CANCELADO", "COMPLETADO"] },
    },
    include: { servicio: true, peluquero: true },
    orderBy: { fechaHora: "asc" },
  });

  const semanaDesdeISO = format(desde, "yyyy-MM-dd");
  const hoyISO = format(hoy, "yyyy-MM-dd");

  // Mobile agenda: fetch turnos for the current month (dot indicators)
  const monthTurnos = await prisma.turno.findMany({
    where: {
      fechaHora: { gte: startOfMonth(hoy), lte: endOfMonth(hoy) },
      estado: { notIn: ["CANCELADO"] },
    },
    include: { servicio: { select: { nombre: true, duracion: true } } },
  });
  const serializedTurnos = monthTurnos.map((t) => ({
    fechaHora: t.fechaHora.toISOString(),
    servicioNombre: t.servicio.nombre,
    clienteNombre: t.clienteNombre,
    duracion: t.servicio.duracion,
  }));

  return (
    <div>
      {/* Desktop: existing calendar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Agenda</h2>
          <a
            href="/admin/turnos/nuevo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Nuevo turno
          </a>
        </div>
        <CalendarioAdmin
          turnos={turnos}
          semanaDesde={semanaDesdeISO}
          hoy={hoyISO}
        />
      </div>

      {/* Mobile: agenda with Year/Month/Day navigation */}
      <div className="md:hidden flex flex-1 flex-col min-h-[calc(100dvh-120px)]">
        <PullToRefresh>
          <AgendaScreen turnos={serializedTurnos} />
        </PullToRefresh>
      </div>
    </div>
  );
}
