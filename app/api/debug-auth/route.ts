import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// [DEBUG-rbac2] Temporary - DELETE after debugging
export async function GET() {
  const session = await auth();

  // Also check DB directly
  const dbUser = await prisma.user.findUnique({
    where: { email: "admin@peluqueria.com" },
    select: { email: true, rol: true, id: true },
  });

  return NextResponse.json({
    session_user: session?.user ?? null,
    session_user_keys: session?.user ? Object.keys(session.user) : [],
    session_role: (session?.user as { role?: string })?.role ?? "NOT_IN_SESSION",
    db_user: dbUser,
    db_rol: dbUser?.rol ?? "NOT_FOUND",
    match: (session?.user as { role?: string })?.role === dbUser?.rol,
  });
}
