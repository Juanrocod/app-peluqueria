import { prisma } from "@/lib/prisma";
import ProductoEditable from "@/components/admin/ProductoEditable";
import FormularioProducto from "@/components/admin/FormularioProducto";

export default async function CatalogoPage() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Catálogo de productos</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Gestioná los productos disponibles para la venta en el establecimiento y hacé seguimiento de las ganancias.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-3">Agregar producto</h3>
          <FormularioProducto />
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-3">Productos activos</h3>
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
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay productos cargados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
