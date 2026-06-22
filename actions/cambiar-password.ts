"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import bcrypt from "bcryptjs";
import { cambiarPasswordSchema } from "@/lib/validations";

export async function cambiarPassword(data: {
  actual: string;
  nueva: string;
}) {
  const validated = cambiarPasswordSchema.parse(data);
  const session = await requireAdmin();
  const email = session.user?.email;
  if (!email) throw new Error("No autenticado");

  if (validated.nueva.length < 8 || !/[A-Z]/.test(validated.nueva) || !/[0-9]/.test(validated.nueva) || !/[^A-Za-z0-9]/.test(validated.nueva)) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Usuario no encontrado." };

  const match = await bcrypt.compare(validated.actual, user.password);
  if (!match) return { ok: false, error: "La contraseña actual es incorrecta." };

  const hashed = await bcrypt.hash(validated.nueva, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return { ok: true };
}
