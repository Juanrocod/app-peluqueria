import { prisma } from "@/lib/prisma";
import FormularioPeluquero from "@/components/admin/FormularioPeluquero";
import { actualizarPeluquero } from "@/actions/peluqueros";

export default async function PeluquerosPage() {
  const peluqueros = await prisma.peluquero.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Peluqueros</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Gestioná el equipo de peluqueros y barberos de la peluquería y habilitá su estado activo.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-3">Agregar peluquero</h3>
          <FormularioPeluquero />
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-3">Personal</h3>
          <div className="flex flex-col gap-3">
            {peluqueros.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-4 flex items-center justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-50">{p.nombre}</div>
                <form
                  action={async () => {
                    "use server";
                    await actualizarPeluquero(p.id, { activo: !p.activo });
                  }}
                >
                  <button
                    type="submit"
                    className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                      p.activo
                        ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </button>
                </form>
              </div>
            ))}
            {peluqueros.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No hay peluqueros cargados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
