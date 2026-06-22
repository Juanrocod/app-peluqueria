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

  if (data.nueva.length < 8 || !/[A-Z]/.test(data.nueva) || !/[0-9]/.test(data.nueva) || !/[^A-Za-z0-9]/.test(data.nueva)) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Usuario no encontrado." };

  const match = await bcrypt.compare(data.actual, user.password);
  if (!match) return { ok: false, error: "La contraseña actual es incorrecta." };

  const hashed = await bcrypt.hash(data.nueva, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return { ok: true };
}
