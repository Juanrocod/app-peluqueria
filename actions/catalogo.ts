"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { crearProductoSchema, actualizarProductoSchema } from "@/lib/validations";

export async function crearProducto(data: {
  nombre: string;
  descripcion?: string;
  precio: number;
  ganancia?: number;
  imagenUrl?: string;
}) {
  const validated = crearProductoSchema.parse(data);
  await requireAdmin();
  await prisma.producto.create({ data: { ...validated, activo: true } });
  revalidatePath("/admin/catalogo");
}

export async function actualizarProducto(
  id: string,
  data: { nombre?: string; descripcion?: string; precio?: number; ganancia?: number; imagenUrl?: string; activo?: boolean }
) {
  const validated = actualizarProductoSchema.parse(data);
  await requireAdmin();
  await prisma.producto.update({ where: { id }, data: validated });
  revalidatePath("/admin/catalogo");
}

export async function eliminarProducto(id: string) {
  await requireAdmin();
  await prisma.producto.update({ where: { id }, data: { activo: false } });
  revalidatePath("/admin/catalogo");
}
