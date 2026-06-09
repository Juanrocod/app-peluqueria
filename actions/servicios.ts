"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearServicio(data: {
  nombre: string;
  duracion: number;
  precio: number;
}) {
  const servicio = await prisma.servicio.create({ data });
  revalidatePath("/admin/servicios");
  return servicio;
}

export async function actualizarServicio(
  id: string,
  data: { nombre?: string; duracion?: number; precio?: number; activo?: boolean }
) {
  const servicio = await prisma.servicio.update({ where: { id }, data });
  revalidatePath("/admin/servicios");
  return servicio;
}

export async function eliminarServicio(id: string) {
  await prisma.servicio.update({
    where: { id },
    data: { activo: false },
  });
  revalidatePath("/admin/servicios");
}
