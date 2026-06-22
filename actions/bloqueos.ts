"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearBloqueoAdmin(data: {
  fecha: Date;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}) {
  await requireAdmin();
  const fechaUTC = new Date(
    Date.UTC(data.fecha.getFullYear(), data.fecha.getMonth(), data.fecha.getDate())
  );
  const creado = await prisma.bloqueoHorario.create({
    data: {
      fecha: fechaUTC,
      todoElDia: data.todoElDia,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      motivo: data.motivo ?? null,
    },
  });
  revalidatePath("/admin/horarios");
  return creado;
}

export async function crearBloqueo(data: {
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}) {
  await requireAdmin();
  await prisma.bloqueoHorario.create({ data });
  revalidatePath("/admin/horarios");
}

export async function actualizarBloqueo(
  id: string,
  data: { fecha?: Date; horaInicio?: string; horaFin?: string; motivo?: string }
) {
  await requireAdmin();
  await prisma.bloqueoHorario.update({ where: { id }, data });
  revalidatePath("/admin/horarios");
}

export async function eliminarBloqueo(id: string) {
  await requireAdmin();
  await prisma.bloqueoHorario.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}
