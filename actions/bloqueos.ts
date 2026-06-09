"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function crearBloqueoAdmin(data: {
  fecha: Date;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}) {
  // Guardar como medianoche UTC para alinear con @db.Date
  const fechaUTC = new Date(
    Date.UTC(data.fecha.getFullYear(), data.fecha.getMonth(), data.fecha.getDate())
  );
  await prisma.bloqueoHorario.create({
    data: {
      fecha: fechaUTC,
      todoElDia: data.todoElDia,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      motivo: data.motivo ?? null,
    },
  });
  revalidatePath("/admin/horarios");
}

export async function crearBloqueo(data: {
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}) {
  await prisma.bloqueoHorario.create({ data });
  revalidatePath("/admin/horarios");
}

export async function actualizarBloqueo(
  id: string,
  data: { fecha?: Date; horaInicio?: string; horaFin?: string; motivo?: string }
) {
  await prisma.bloqueoHorario.update({ where: { id }, data });
  revalidatePath("/admin/horarios");
}

export async function eliminarBloqueo(id: string) {
  await prisma.bloqueoHorario.delete({ where: { id } });
  revalidatePath("/admin/horarios");
}
