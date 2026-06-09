import { prisma } from "@/lib/prisma";
import FormularioServicio from "@/components/admin/FormularioServicio";
import ServicioEditable from "@/components/admin/ServicioEditable";

export default async function ServiciosPage() {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Servicios</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Gestioná los servicios que ofrece la peluquería, sus duraciones y precios.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-3">Agregar servicio</h3>
          <FormularioServicio />
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-3">Servicios activos</h3>
          <div className="flex flex-col gap-3">
            {servicios.map((s) => (
              <ServicioEditable
                key={s.id}
                servicio={{ id: s.id, nombre: s.nombre, duracion: s.duracion, precio: Number(s.precio) }}
              />
            ))}
            {servicios.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay servicios cargados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
