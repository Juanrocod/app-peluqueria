export const revalidate = 30;
import { prisma } from "@/lib/prisma";
import { TurnosScreen } from "@/components/mobile/turnos/TurnosScreen";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { DesktopTurnosClient } from "@/components/admin/turnos/DesktopTurnosClient";

export default async function TurnosPage() {
  const lastSeenRow = await prisma.configuracionApp.findUnique({ where: { clave: "admin_last_seen_turnos" } });
  const lastSeen = lastSeenRow?.valor ?? new Date(0).toISOString();

  const turnos = await prisma.turno.findMany({
    include: { servicio: true, peluquero: true, productos: { include: { producto: true } }, servicios: { include: { servicio: true } } },
    orderBy: { fechaHora: "asc" },
    take: 100,
  });

  const serializedTurnos = turnos.map((t) => ({
    id: t.id,
    fechaHora: t.fechaHora.toISOString(),
    clienteNombre: t.clienteNombre,
    clienteTelefono: t.clienteTelefono,
    clienteEmail: t.clienteEmail ?? null,
    observaciones: t.observaciones ?? null,
    modalidad: t.modalidad,
    direccion: t.direccion ?? null,
    estado: t.estado,
    servicio: {
      nombre: t.servicio.nombre,
      precio: Number(t.servicio.precio),
      duracion: t.servicio.duracion,
    },
    servicios: t.servicios.map((ts) => ({
      nombre: ts.servicio.nombre,
      duracion: ts.duracionSnapshot,
      precio: Number(ts.servicio.precio),
    })),
    isNew: t.createdAt.toISOString() > lastSeen,
  }));

  return (
    <div>
      {/* Mobile view */}
      <div className="flex flex-1 flex-col md:hidden">
        <PullToRefresh>
          <TurnosScreen turnos={serializedTurnos} />
        </PullToRefresh>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <DesktopTurnosClient turnos={serializedTurnos} />
      </div>
    </div>
  );
}
