import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import TodayView from "@/components/admin/today/TodayView";
import { HoyScreen } from "@/components/mobile/hoy/HoyScreen";
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

  // Serialize for client components (Dates → ISO strings, Decimals → numbers)
  const serializedTurnos = turnos.map((t) => ({
    ...t,
    fechaHora: t.fechaHora.toISOString(),
    servicio: {
      ...t.servicio,
      precio: Number(t.servicio.precio),
    },
  }));

  const slotsTotal = turnos.length + slotsLibres;

  return (
    <div className="flex flex-col overflow-auto">
      {/* Desktop view */}
      <div className="hidden md:block">
        <TodayView
          turnos={turnos}
          slotsLibres={slotsLibres}
          fecha={format(hoy, "yyyy-MM-dd")}
        />
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <HoyScreen turnos={serializedTurnos} slotsTotal={slotsTotal} />
      </div>
    </div>
  );
}
