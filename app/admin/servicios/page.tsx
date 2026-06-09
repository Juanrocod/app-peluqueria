import { prisma } from "@/lib/prisma";
import FormularioServicio from "@/components/admin/FormularioServicio";
import ServicioEditable from "@/components/admin/ServicioEditable";

export default async function ServiciosPage() {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Servicios</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-3">Agregar servicio</h3>
          <FormularioServicio />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Servicios activos</h3>
          <div className="flex flex-col gap-2">
            {servicios.map((s) => (
              <ServicioEditable
                key={s.id}
                servicio={{ id: s.id, nombre: s.nombre, duracion: s.duracion, precio: Number(s.precio) }}
              />
            ))}
            {servicios.length === 0 && (
              <p className="text-gray-400 text-sm">No hay servicios cargados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
