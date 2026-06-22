"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import bcrypt from "bcryptjs";

export async function cambiarPassword(data: {
  actual: string;
  nueva: string;
}) {
  const session = await requireAdmin();
  const email = session.user?.email;
  if (!email) throw new Error("No autenticado");

  if (data.nueva.length < 8) {
    return { ok: false, error: "La contraseña nueva debe tener al menos 8 caracteres." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Usuario no encontrado." };

  const match = await bcrypt.compare(data.actual, user.password);
  if (!match) return { ok: false, error: "La contraseña actual es incorrecta." };

  const hashed = await bcrypt.hash(data.nueva, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return { ok: true };
}
