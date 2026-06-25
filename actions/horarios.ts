"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { crearFranjaSchema } from "@/lib/validations";

export async function crearFranja(data: {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  etiqueta?: string;
  esBloqueo?: boolean;
}) {
  crearFranjaSchema.parse(data);
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
  const validated = crearFranjaSchema.parse(data);
  await requireAdmin();
  const creada = await prisma.horarioAtencion.create({
    data: {
      diaSemana: validated.diaSemana,
      horaApertura: validated.horaApertura,
      horaCierre: validated.horaCierre,
      tipoFranja: validated.tipoFranja,
      esBloqueo: validated.tipoFranja === "NEGATIVA",
      motivo: validated.motivo ?? null,
      activo: true,
    },
  });
  revalidatePath("/admin/horarios");
  return creada;
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

export async function copiarFranjasATodos(fromDia: number) {
  await requireAdmin();
  const source = await prisma.horarioAtencion.findMany({
    where: { diaSemana: fromDia, tipoFranja: "POSITIVA", activo: true },
  });
  if (source.length === 0) return;

  const targetDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== fromDia);

  for (const dia of targetDays) {
    await prisma.horarioAtencion.deleteMany({
      where: { diaSemana: dia, tipoFranja: "POSITIVA" },
    });
    await prisma.horarioAtencion.createMany({
      data: source.map((fr) => ({
        diaSemana: dia,
        horaApertura: fr.horaApertura,
        horaCierre: fr.horaCierre,
        tipoFranja: "POSITIVA" as const,
        activo: true,
      })),
    });
  }
  revalidatePath("/admin/horarios");
}

export async function toggleFranja(id: string, activo: boolean) {
  await requireAdmin();
  await prisma.horarioAtencion.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/horarios");
}

export async function crearFranjaPremium(data: {
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  recargo: number;
}) {
  await requireAdmin();
  const validated = crearFranjaSchema.parse({
    ...data,
    tipoFranja: "POSITIVA",
  });
  const creada = await prisma.horarioAtencion.create({
    data: {
      diaSemana: validated.diaSemana,
      horaApertura: validated.horaApertura,
      horaCierre: validated.horaCierre,
      tipoFranja: "POSITIVA",
      etiqueta: "premium",
      recargo: validated.recargo,
      activo: true,
    },
  });
  revalidatePath("/admin/horarios");
  return creada;
}

export async function eliminarFranjaPremium(id: string) {
  await requireAdmin();
  await prisma.horarioAtencion.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}
