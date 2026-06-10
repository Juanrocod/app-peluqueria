import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import TodayView from "@/components/admin/today/TodayView";
import { getSlotDisponibles } from "@/lib/disponibilidad";

export default async function HoyPage() {
  const hoy   = new Date();
  const desde = startOfDay(hoy);
  const hasta = endOfDay(hoy);

  const turnos = await prisma.turno.findMany({
    where: {
      fechaHora: { gte: desde, lte: hasta },
      estado: { notIn: ["CANCELADO"] },
    },
    include: { servicio: true },
    orderBy: { fechaHora: "asc" },
  });

  // Count free slots using the real availability engine (30-min granularity)
  const slotsArray = await getSlotDisponibles(hoy, 30);
  const slotsLibres = slotsArray.length;

  return (
    <div className="flex flex-col overflow-auto">
      <TodayView
        turnos={turnos}
        slotsLibres={slotsLibres}
        fecha={format(hoy, "yyyy-MM-dd")}
      />
    </div>
  );
}
