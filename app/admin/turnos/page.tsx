import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AccionesTurnoRow from "@/components/admin/AccionesTurnoRow";

export default async function TurnosPage() {
  const turnos = await prisma.turno.findMany({
    include: { servicio: true, peluquero: true, productos: { include: { producto: true } } },
    orderBy: { fechaHora: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Turnos</h2>
        <a
          href="/admin/turnos/nuevo"
          className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer shadow-xs"
        >
          + Nuevo turno
        </a>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Fecha y hora</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Servicio</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Productos</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Dirección</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Origen</th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {turnos.map((turno) => (
                <tr key={turno.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 font-mono">
                    {format(turno.fechaHora, "dd/MM HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{turno.clienteNombre}</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-xs">{turno.clienteTelefono}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200 font-medium">{turno.servicio.nombre}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs max-w-[180px] truncate" title={turno.productos.map((tp) => tp.producto.nombre).join(", ")}>
                    {turno.productos.length > 0
                      ? turno.productos.map((tp) => tp.producto.nombre).join(", ")
                      : <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {turno.modalidad === "DOMICILIO"
                      ? <span className="text-amber-600 dark:text-amber-400 font-medium">{turno.direccion || "—"}</span>
                      : <span className="text-zinc-400 dark:text-zinc-500">Peluquería</span>}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={turno.estado} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{turno.origen}</td>
                  <td className="px-4 py-3">
                    <AccionesTurnoRow turnoId={turno.id} estadoActual={turno.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {turnos.length === 0 && (
          <p className="text-center py-12 text-zinc-400 dark:text-zinc-500 italic">No hay turnos registrados</p>
        )}
      </div>
    </div>
  );
}
function EstadoBadge({ estado }: { estado: string }) {
  const colores: Record<string, string> = {
    PENDIENTE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    CONFIRMADO: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",
    CANCELADO: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    COMPLETADO: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block border ${colores[estado] ?? ""}`}>
      {estado}
    </span>
  );
}