"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearProducto(data: {
  nombre: string;
  descripcion?: string;
  precio: number;
  ganancia?: number;
  imagenUrl?: string;
}) {
  await prisma.producto.create({ data: { ...data, activo: true } });
  revalidatePath("/admin/catalogo");
}

export async function actualizarProducto(
  id: string,
  data: { nombre?: string; descripcion?: string; precio?: number; ganancia?: number; imagenUrl?: string; activo?: boolean }
) {
  await prisma.producto.update({ where: { id }, data });
  revalidatePath("/admin/catalogo");
}

export async function eliminarProducto(id: string) {
  await prisma.producto.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin/catalogo");
}
