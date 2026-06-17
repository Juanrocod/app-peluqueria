"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registrarPeluquero(data: {
  nombreNegocio: string;
  nombre: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese email." };
  }

  const hashed = await bcrypt.hash(data.password, 10);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        nombre: data.nombre,
        rol: "ADMIN",
      },
    }),
    prisma.configuracionApp.upsert({
      where: { clave: "marca_nombre" },
      update: { valor: data.nombreNegocio },
      create: { clave: "marca_nombre", valor: data.nombreNegocio },
    }),
  ]);

  return { ok: true };
}
