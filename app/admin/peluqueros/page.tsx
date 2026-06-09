import { prisma } from "@/lib/prisma";
import FormularioPeluquero from "@/components/admin/FormularioPeluquero";
import { actualizarPeluquero } from "@/actions/peluqueros";

export default async function PeluquerosPage() {
  const peluqueros = await prisma.peluquero.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Peluqueros</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-3">Agregar peluquero</h3>
          <FormularioPeluquero />
        </div>
        <div>
          <h3 className="font-semibold mb-3">Personal</h3>
          <div className="flex flex-col gap-2">
            {peluqueros.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg border px-4 py-3 flex items-center justify-between"
              >
                <div className="font-medium">{p.nombre}</div>
                <form
                  action={async () => {
                    "use server";
                    await actualizarPeluquero(p.id, { activo: !p.activo });
                  }}
                >
                  <button
                    className={`text-sm px-3 py-1 rounded-full border transition ${
                      p.activo
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : "border-gray-400 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </button>
                </form>
              </div>
            ))}
            {peluqueros.length === 0 && (
              <p className="text-gray-400 text-sm">No hay peluqueros cargados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
