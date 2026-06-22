import { prisma } from "@/lib/prisma";
import ProductoEditable from "@/components/admin/ProductoEditable";
import FormularioProducto from "@/components/admin/FormularioProducto";
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
        <h2 className="text-2xl font-bold mb-6">Catálogo de productos</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-3">Agregar producto</h3>
            <FormularioProducto />
          </div>
          <div>
            <h3 className="font-semibold mb-3">Productos activos</h3>
            <div className="flex flex-col gap-3">
              {productos.map((p) => (
                <ProductoEditable
                  key={p.id}
                  producto={{
                    id: p.id,
                    nombre: p.nombre,
                    descripcion: p.descripcion ?? "",
                    precio: Number(p.precio),
                    ganancia: p.ganancia !== null ? Number(p.ganancia) : null,
                    imagenUrl: p.imagenUrl ?? "",
                  }}
                />
              ))}
              {productos.length === 0 && (
                <p className="text-zinc-500 text-sm">No hay productos cargados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
