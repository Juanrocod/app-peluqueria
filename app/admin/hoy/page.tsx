export const revalidate = 30;
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";
import TodayView from "@/components/admin/today/TodayView";
import { HoyScreen } from "@/components/mobile/hoy/HoyScreen";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { getSlotDisponibles } from "@/lib/disponibilidad";

export default async function HoyPage() {
  // Calculate "today" in Argentina (UTC-3)
  const nowUtc = new Date();
  const arNow = new Date(nowUtc.getTime() - 3 * 60 * 60 * 1000);
  const arYear = arNow.getUTCFullYear();
  const arMonth = arNow.getUTCMonth();
  const arDay = arNow.getUTCDate();

  // Turnos are stored with +3h offset (9:00 AR = T12:00Z)
  // So "today in Argentina" in UTC is: 03:00 UTC (00:00 AR) to 02:59 UTC next day (23:59 AR)
  const desde = new Date(Date.UTC(arYear, arMonth, arDay, 3, 0, 0));
  const hasta = new Date(Date.UTC(arYear, arMonth, arDay + 1, 2, 59, 59, 999));
  const hoy = new Date(arYear, arMonth, arDay);

  const turnos = await prisma.turno.findMany({
    where: {
      fechaHora: { gte: desde, lte: hasta },
      estado: { notIn: ["CANCELADO"] },
    },
    include: { servicio: true, productos: { include: { producto: true } }, servicios: { include: { servicio: true } } },
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
    productos: t.productos.map((tp) => ({
      nombre: tp.producto.nombre,
    })),
    servicios: t.servicios.map((ts) => ({
      nombre: ts.servicio.nombre,
      duracion: ts.duracionSnapshot,
      precio: Number(ts.servicio.precio),
    })),
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
      <div className="flex flex-1 flex-col md:hidden">
        <PullToRefresh>
          <HoyScreen turnos={serializedTurnos} slotsTotal={slotsTotal} />
        </PullToRefresh>
      </div>
    </div>
  );
}
