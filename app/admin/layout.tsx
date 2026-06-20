import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MobileBottomNav } from "@/components/mobile/BottomNav";
import { MobileAppBar } from "@/components/mobile/AppBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") redirect("/reservar");

  const marcaNombre = await prisma.configuracionApp
    .findUnique({ where: { clave: "marca_nombre" } })
    .then((r) => r?.valor ?? "Peluquería");

  return (
    <>
      <AdminSidebar email={session.user.email ?? ""}>
        <MobileAppBar businessName={marcaNombre} />
        {children}
      </AdminSidebar>
      <MobileBottomNav />
    </>
  );
}
