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
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Fecha y hora</th>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Servicio</th>
              <th className="text-left px-4 py-3 font-medium">Productos</th>
              <th className="text-left px-4 py-3 font-medium">Dirección</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium">Origen</th>
              <th className="text-left px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => (
              <tr key={turno.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {format(turno.fechaHora, "dd/MM HH:mm", { locale: es })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{turno.clienteNombre}</div>
                  <div className="text-gray-500">{turno.clienteTelefono}</div>
                </td>
                <td className="px-4 py-3">{turno.servicio.nombre}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {turno.productos.length > 0
                    ? turno.productos.map((tp) => tp.producto.nombre).join(", ")
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-sm">
                  {turno.modalidad === "DOMICILIO"
                    ? <span className="text-amber-700">{turno.direccion || "—"}</span>
                    : <span className="text-gray-400">Peluquería</span>}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={turno.estado} />
                </td>
                <td className="px-4 py-3 text-gray-500">{turno.origen}</td>
                <td className="px-4 py-3">
                  <AccionesturnoRow turnoId={turno.id} estadoActual={turno.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {turnos.length === 0 && (
          <p className="text-center py-8 text-gray-400">No hay turnos registrados</p>
        )}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const colores: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    CONFIRMADO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800",
    COMPLETADO: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colores[estado] ?? ""}`}>
      {estado}
    </span>
  );
}
