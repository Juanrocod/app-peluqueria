export const revalidate = 120;
import { prisma } from "@/lib/prisma";
import { ServiciosMobile } from "@/components/mobile/config/ServiciosMobile";

export default async function ServiciosPage() {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  const serialized = servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    duracion: s.duracion,
    precio: Number(s.precio),
  }));

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <ServiciosMobile servicios={serialized} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <ServiciosMobile servicios={serialized} />
      </div>
    </>
  );
}
