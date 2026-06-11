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
                className="bg-zinc-900 rounded-lg border border-zinc-800 px-4 py-3 flex items-center justify-between"
              >
                <div className="font-medium text-zinc-100">{p.nombre}</div>
                <form
                  action={async () => {
                    "use server";
                    await actualizarPeluquero(p.id, { activo: !p.activo });
                  }}
                >
                  <button
                    className={`text-sm px-3 py-1 rounded-full border transition ${
                      p.activo
                        ? "border-green-600 text-green-400 hover:bg-green-900/30"
                        : "border-zinc-600 text-zinc-500 hover:bg-zinc-800"
                    }`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </button>
                </form>
              </div>
            ))}
            {peluqueros.length === 0 && (
              <p className="text-zinc-500 text-sm">No hay peluqueros cargados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
