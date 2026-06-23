"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function markTurnosSeen() {
  await requireAdmin();
  await prisma.configuracionApp.upsert({
    where: { clave: "admin_last_seen_turnos" },
    update: { valor: new Date().toISOString() },
    create: { clave: "admin_last_seen_turnos", valor: new Date().toISOString() },
  });
  revalidatePath("/admin");
}
