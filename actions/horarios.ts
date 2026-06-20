"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearFranja(data: {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  etiqueta?: string;
  esBloqueo?: boolean;
}) {
  await requireAdmin();
  await prisma.horarioAtencion.create({ data: { ...data, activo: true } });
  revalidatePath("/admin/horarios");
}

export async function crearFranjaAdmin(data: {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
  motivo?: string;
}) {
  await requireAdmin();
  await prisma.horarioAtencion.create({
    data: {
      diaSemana: data.diaSemana,
      horaApertura: data.horaApertura,
      horaCierre: data.horaCierre,
      tipoFranja: data.tipoFranja,
      esBloqueo: data.tipoFranja === "NEGATIVA",
      motivo: data.motivo ?? null,
      activo: true,
    },
  });
  revalidatePath("/admin/horarios");
}

export async function eliminarFranjaAdmin(id: string) {
  await requireAdmin();
  await prisma.horarioAtencion.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}

export async function actualizarFranja(
  id: string,
  data: { horaApertura?: string; horaCierre?: string; etiqueta?: string; activo?: boolean }
) {
  await requireAdmin();
  await prisma.horarioAtencion.update({ where: { id }, data });
  revalidatePath("/admin/horarios");
}

export async function eliminarFranja(id: string) {
  await requireAdmin();
  await prisma.horarioAtencion.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}

export async function toggleFranja(id: string, activo: boolean) {
  await requireAdmin();
  await prisma.horarioAtencion.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/horarios");
}
