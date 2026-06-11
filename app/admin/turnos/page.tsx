import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AccionesturnoRow from "@/components/admin/AccionesTurnoRow";

export default async function TurnosPage() {
  const turnos = await prisma.turno.findMany({
    include: { servicio: true, peluquero: true, productos: { include: { producto: true } } },
    orderBy: { fechaHora: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Turnos</h2>
        <a
          href="/admin/turnos/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Nuevo turno
        </a>
      </div>
      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 border-b border-zinc-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Fecha y hora</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Servicio</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Productos</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Dirección</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Origen</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => (
              <tr key={turno.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                <td className="px-4 py-3">
                  {format(turno.fechaHora, "dd/MM HH:mm", { locale: es })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{turno.clienteNombre}</div>
                  <div className="text-zinc-400">{turno.clienteTelefono}</div>
                </td>
                <td className="px-4 py-3">{turno.servicio.nombre}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {turno.productos.length > 0
                    ? turno.productos.map((tp) => tp.producto.nombre).join(", ")
                    : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3 text-sm">
                  {turno.modalidad === "DOMICILIO"
                    ? <span className="text-amber-400">{turno.direccion || "—"}</span>
                    : <span className="text-zinc-500">Peluquería</span>}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={turno.estado} />
                </td>
                <td className="px-4 py-3 text-zinc-400">{turno.origen}</td>
                <td className="px-4 py-3">
                  <AccionesturnoRow turnoId={turno.id} estadoActual={turno.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {turnos.length === 0 && (
          <p className="text-center py-8 text-zinc-500">No hay turnos registrados</p>
        )}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const colores: Record<string, string> = {
    PENDIENTE:  "bg-yellow-900/40 text-yellow-300",
    CONFIRMADO: "bg-green-900/40 text-green-300",
    CANCELADO:  "bg-red-900/40 text-red-300",
    COMPLETADO: "bg-zinc-800 text-zinc-400",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colores[estado] ?? ""}`}>
      {estado}
    </span>
  );
}
