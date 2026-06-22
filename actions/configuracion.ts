"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { setConfigSchema, crearCodigoSchema, sanitizeUrl } from "@/lib/validations";

const PUBLIC_KEYS = ["marca_nombre", "marca_descripcion", "marca_imagen_fondo", "marca_telefono", "marca_direccion"];

export async function getConfiguracion() {
  await requireAdmin();
  const rows = await prisma.configuracionApp.findMany();
  return Object.fromEntries(rows.map((r) => [r.clave, r.valor])) as Record<string, string>;
}

export async function getConfiguracionPublica() {
  const rows = await prisma.configuracionApp.findMany({ where: { clave: { in: PUBLIC_KEYS } } });
  return Object.fromEntries(rows.map((r) => [r.clave, r.valor])) as Record<string, string>;
}

export async function setConfiguracion(clave: string, valor: string) {
  const validated = setConfigSchema.parse({ clave, valor });
  await requireAdmin();
  const finalValue = validated.clave.includes("imagen") ? sanitizeUrl(validated.valor) : validated.valor;
  await prisma.configuracionApp.upsert({
    where: { clave: validated.clave },
    update: { valor: finalValue },
    create: { clave: validated.clave, valor: finalValue },
  });
  revalidatePath("/admin/configuracion");
  revalidatePath("/reservar");
}

export async function getCodigoActivo() {
  await requireAdmin();
  return prisma.codigoDescuento.findFirst({ where: { activo: true } });
}

export async function crearCodigo(codigo: string, descuento: number) {
  const validated = crearCodigoSchema.parse({ codigo, descuento });
  await requireAdmin();
  await prisma.codigoDescuento.updateMany({ data: { activo: false } });
  await prisma.codigoDescuento.create({ data: { codigo: validated.codigo.toUpperCase(), descuento: validated.descuento, activo: true } });
  revalidatePath("/admin/configuracion");
}

export async function desactivarCodigo() {
  await requireAdmin();
  await prisma.codigoDescuento.updateMany({ data: { activo: false } });
  revalidatePath("/admin/configuracion");
}
