import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth();

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
