import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") throw new Error("No autorizado");
  return session;
}
