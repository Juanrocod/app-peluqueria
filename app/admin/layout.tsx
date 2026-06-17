import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MobileBottomNav } from "@/components/mobile/BottomNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <AdminSidebar email={session?.user?.email ?? ""}>
        {children}
      </AdminSidebar>
      <MobileBottomNav />
    </>
  );
}
