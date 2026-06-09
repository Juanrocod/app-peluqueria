"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearPeluquero(data: { nombre: string }) {
  const peluquero = await prisma.peluquero.create({ data });
  revalidatePath("/admin/peluqueros");
  return peluquero;
}

export async function actualizarPeluquero(
  id: string,
  data: { nombre?: string; activo?: boolean }
) {
  const peluquero = await prisma.peluquero.update({ where: { id }, data });
  revalidatePath("/admin/peluqueros");
  return peluquero;
}
