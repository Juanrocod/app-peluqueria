export const revalidate = 120;
import { prisma } from "@/lib/prisma";
import { ProductosMobile } from "@/components/mobile/config/ProductosMobile";

export default async function CatalogoPage() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  const serialized = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: Number(p.precio),
    ganancia: p.ganancia !== null ? Number(p.ganancia) : null,
    imagenUrl: p.imagenUrl ?? "",
  }));

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <ProductosMobile productos={serialized} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <ProductosMobile productos={serialized} />
      </div>
    </>
  );
}
