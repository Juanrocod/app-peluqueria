"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { crearServicioSchema, actualizarServicioSchema } from "@/lib/validations";

export async function crearServicio(data: {
  nombre: string;
  duracion: number;
  precio: number;
}) {
  const validated = crearServicioSchema.parse(data);
  await requireAdmin();
  const servicio = await prisma.servicio.create({ data: validated });
  revalidatePath("/admin/servicios");
  return servicio;
}

export async function actualizarServicio(
  id: string,
  data: { nombre?: string; duracion?: number; precio?: number; activo?: boolean }
) {
  const validated = actualizarServicioSchema.parse(data);
  await requireAdmin();
  const servicio = await prisma.servicio.update({ where: { id }, data: validated });
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
