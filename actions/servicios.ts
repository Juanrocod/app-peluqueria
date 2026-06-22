"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearServicio(data: {
  nombre: string;
  duracion: number;
  precio: number;
}) {
  await requireAdmin();
  const servicio = await prisma.servicio.create({ data });
  revalidatePath("/admin/servicios");
  return servicio;
}

export async function actualizarServicio(
  id: string,
  data: { nombre?: string; duracion?: number; precio?: number; activo?: boolean }
) {
  await requireAdmin();
  const servicio = await prisma.servicio.update({ where: { id }, data });
  revalidatePath("/admin/servicios");
  return servicio;
}

export async function eliminarServicio(id: string) {
  await requireAdmin();
  await prisma.servicio.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/admin/servicios");
}
