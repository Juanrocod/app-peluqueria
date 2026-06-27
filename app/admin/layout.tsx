import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MobileBottomNav } from "@/components/mobile/BottomNav";
import { MobileAppBar } from "@/components/mobile/AppBar";
import { PushSubscriber } from "@/components/mobile/PushSubscriber";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [marcaRow, lastSeenRow, newestTurno] = await Promise.all([
    prisma.configuracionApp.findUnique({ where: { clave: "marca_nombre" } }),
    prisma.configuracionApp.findUnique({ where: { clave: "admin_last_seen_turnos" } }),
    prisma.turno.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
  ]);

  const marcaNombre = marcaRow?.valor ?? "Peluquería";
  const lastSeen = lastSeenRow?.valor ? new Date(lastSeenRow.valor) : new Date(0);
  const hasNewTurnos = newestTurno ? newestTurno.createdAt > lastSeen : false;

  return (
    <>
      <AdminSidebar email={session.user.email ?? ""} hasNewTurnos={hasNewTurnos}>
        <MobileAppBar businessName={marcaNombre} />
        {children}
      </AdminSidebar>
      <MobileBottomNav hasNewTurnos={hasNewTurnos} />
      <PushSubscriber />
    </>
  );
}
