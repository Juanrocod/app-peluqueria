import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// [DEBUG-rbac] Temporary endpoint to inspect session shape on Vercel
// DELETE THIS FILE after debugging
export async function GET() {
  const session = await auth();
  return NextResponse.json({
    hasSession: !!session,
    hasUser: !!session?.user,
    userKeys: session?.user ? Object.keys(session.user) : [],
    userEmail: session?.user?.email ?? null,
    userRole: (session?.user as { role?: string })?.role ?? "MISSING",
    fullUser: session?.user ?? null,
  });
}
