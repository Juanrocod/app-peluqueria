"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelarTurnoPorCliente(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  if (!token || typeof token !== "string" || token.length !== 32) {
    return { ok: false, error: "Token inválido." };
  }

  const turno = await prisma.turno.findFirst({
    where: { cancelToken: token },
    include: {
      servicio: { select: { nombre: true } },
      servicios: { include: { servicio: { select: { nombre: true } } } },
    },
  });

  if (!turno) {
    return { ok: false, error: "Turno no encontrado." };
  }

  if (turno.estado === "CANCELADO") {
    return { ok: false, error: "Este turno ya fue cancelado." };
  }

  if (turno.estado === "COMPLETADO") {
    return { ok: false, error: "Este turno ya fue realizado." };
  }

  // Check time: must be >2 hours before turno time
  // turno.fechaHora is stored with AR offset (+3h), so the stored value
  // is the correct comparison point since browser sends AR time
  const msUntilTurno = turno.fechaHora.getTime() - Date.now();
  const twoHoursMs = 2 * 60 * 60 * 1000;

  if (msUntilTurno <= twoHoursMs) {
    return {
      ok: false,
      error: "Ya no se puede cancelar. Solo se puede cancelar hasta 2 horas antes del turno.",
    };
  }

  await prisma.turno.update({
    where: { id: turno.id },
    data: { estado: "CANCELADO" },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  revalidatePath("/admin/hoy");

  // Send push notification to admin
  try {
    const { sendPushToAll } = await import("@/lib/push");
    const svcNames =
      turno.servicios.length > 0
        ? turno.servicios.map((ts) => ts.servicio.nombre).join(", ")
        : turno.servicio.nombre;
    const fechaStr = turno.fechaHora.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
    });
    const horaStr = `${String(turno.fechaHora.getHours()).padStart(2, "0")}:${String(turno.fechaHora.getMinutes()).padStart(2, "0")}`;
    await sendPushToAll(
      "Turno cancelado",
      `${turno.clienteNombre} canceló su turno del ${fechaStr} a las ${horaStr} (${svcNames})`,
      "/admin/turnos"
    );
  } catch {
    // Push failure should not break the cancellation flow
  }

  return { ok: true };
}
