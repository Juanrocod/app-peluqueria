import { prisma } from "@/lib/prisma";
import FormularioTurnoManual from "@/components/admin/FormularioTurnoManual";

export default async function NuevoTurnoPage() {
  const [servicios, peluqueros] = await Promise.all([
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.peluquero.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="px-4 py-4 md:px-0 md:py-0">
      <h2 className="mb-4 text-xl font-bold md:text-2xl md:mb-6">Nuevo turno manual</h2>
      <div className="max-w-lg">
        <FormularioTurnoManual servicios={servicios} peluqueros={peluqueros} />
      </div>
    </div>
  );
}
