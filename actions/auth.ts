"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// FASE 2: Migrar a sistema de código de invitación cuando se escale a multi-tenant
export async function registrarPeluquero(data: {
  nombreNegocio: string;
  nombre: string;
  email: string;
  password: string;
}) {
  if (data.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const hashed = await bcrypt.hash(data.password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const adminExists = await tx.user.findFirst({ where: { rol: "ADMIN" } });
      if (adminExists) throw new Error("ADMIN_EXISTS");

      const existing = await tx.user.findUnique({ where: { email: data.email } });
      if (existing) throw new Error("EMAIL_EXISTS");

      await tx.user.create({
        data: {
          email: data.email.slice(0, 100),
          password: hashed,
          nombre: data.nombre.slice(0, 100),
          rol: "ADMIN",
        },
      });
      await tx.configuracionApp.upsert({
        where: { clave: "marca_nombre" },
        update: { valor: data.nombreNegocio.slice(0, 100) },
        create: { clave: "marca_nombre", valor: data.nombreNegocio.slice(0, 100) },
      });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "ADMIN_EXISTS") return { ok: false, error: "Ya existe una cuenta de administrador registrada." };
    if (msg === "EMAIL_EXISTS") return { ok: false, error: "Ya existe una cuenta con ese email." };
    throw err;
  }

  return { ok: true };
}
