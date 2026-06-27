export const revalidate = 120;
import { prisma } from "@/lib/prisma";
import { GananciasScreen } from "@/components/mobile/ganancias/GananciasScreen";
import { DesktopGananciasClient } from "@/components/admin/ganancias/DesktopGananciasClient";
import { PullToRefresh } from "@/components/ui/PullToRefresh";

export default async function GananciasPage() {
  const turnos = await prisma.turno.findMany({
    where: { estado: "COMPLETADO" },
    include: {
      servicio: { select: { nombre: true, precio: true } },
      productos: {
        include: {
          producto: { select: { nombre: true } },
        },
      },
      servicios: {
        include: {
          servicio: { select: { nombre: true, precio: true } },
        },
      },
    },
    orderBy: { fechaHora: "desc" },
  });

  const serializedForMobile = turnos.map((t) => {
    const hasMultiSvc = t.servicios.length > 0;
    const gananciaProductos = t.productos.reduce(
      (sum, tp) => sum + Number(tp.gananciaFinal ?? 0),
      0
    );
    const gananciaServicio = hasMultiSvc
      ? t.servicios.reduce(
          (sum, ts) => sum + Number(ts.precioSnapshot ?? ts.servicio.precio),
          0
        )
      : Number(t.precioServicioFinal ?? t.servicio.precio);
    return {
      fechaHora: t.fechaHora.toISOString(),
      precioFinal: gananciaServicio + gananciaProductos,
      servicioNombre: hasMultiSvc
        ? t.servicios.map((ts) => ts.nombreSnapshot ?? ts.servicio.nombre).join(", ")
        : (t.nombreServicioFinal ?? t.servicio.nombre),
    };
  });

  const serializedForDesktop = turnos.map((t) => {
    const hasMultiSvc = t.servicios.length > 0;
    return {
      fechaHora: t.fechaHora.toISOString(),
      gananciaServicio: hasMultiSvc
        ? t.servicios.reduce(
            (sum, ts) => sum + Number(ts.precioSnapshot ?? ts.servicio.precio),
            0
          )
        : Number(t.precioServicioFinal ?? t.servicio.precio),
      servicioNombre: hasMultiSvc
        ? t.servicios.map((ts) => ts.nombreSnapshot ?? ts.servicio.nombre).join(", ")
        : (t.nombreServicioFinal ?? t.servicio.nombre),
      productos: t.productos.map((tp) => ({
        nombre: tp.nombreProductoFinal ?? tp.producto.nombre,
        ganancia: Number(tp.gananciaFinal ?? 0),
      })),
    };
  });

  return (
    <div>
      {/* Mobile view */}
      <div className="flex flex-1 flex-col md:hidden">
        <PullToRefresh>
          <GananciasScreen turnos={serializedForMobile} />
        </PullToRefresh>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <DesktopGananciasClient turnos={serializedForDesktop} />
      </div>
    </div>
  );
}
