import { prisma } from "@/lib/prisma";
import FormularioTurnoManual from "@/components/admin/FormularioTurnoManual";

export default async function NuevoTurnoPage() {
  const [servicios, peluqueros] = await Promise.all([
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    prisma.peluquero.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Nuevo turno manual</h2>
      <FormularioTurnoManual servicios={servicios} peluqueros={peluqueros} />
    </div>
  );
}
