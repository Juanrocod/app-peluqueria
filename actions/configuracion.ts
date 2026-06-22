"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function getConfiguracion() {
  const rows = await prisma.configuracionApp.findMany();
  return Object.fromEntries(rows.map((r) => [r.clave, r.valor])) as Record<string, string>;
}

export async function setConfiguracion(clave: string, valor: string) {
  await requireAdmin();
  await prisma.configuracionApp.upsert({
    where: { clave },
    update: { valor },
    create: { clave, valor },
  });
  revalidatePath("/admin/configuracion");
  revalidatePath("/reservar");
}

export async function getCodigoActivo() {
  return prisma.codigoDescuento.findFirst({ where: { activo: true } });
}

export async function crearCodigo(codigo: string, descuento: number) {
  await requireAdmin();
  await prisma.codigoDescuento.updateMany({ data: { activo: false } });
  await prisma.codigoDescuento.create({ data: { codigo: codigo.toUpperCase(), descuento, activo: true } });
  revalidatePath("/admin/configuracion");
}

export async function desactivarCodigo() {
  await requireAdmin();
  await prisma.codigoDescuento.updateMany({ data: { activo: false } });
  revalidatePath("/admin/configuracion");
}
