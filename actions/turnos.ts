"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EstadoTurno, OrigenTurno } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guard";

export async function crearTurno(data: {
  fechaHora: Date;
  fechaStr?: string;
  horaSlot?: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  observaciones?: string;
  modalidad?: "PRESENCIAL" | "DOMICILIO";
  direccion?: string;
  servicioId: string;
  peluqueroId?: string;
  notas?: string;
  origen?: OrigenTurno;
  descuentoAplicado?: number;
  productoIds?: string[];
}) {
  try {
    const { bookingLimiter } = await import("@/lib/rate-limit");
    const { success } = await bookingLimiter.limit(data.clienteTelefono || "anon");
    if (!success) throw new Error("Demasiados intentos. Esperá un momento.");
  } catch (e) { if (e instanceof Error && e.message.includes("Demasiados")) throw e; }

  const servicio = await prisma.servicio.findUnique({ where: { id: data.servicioId } });
  if (!servicio) throw new Error("Servicio no encontrado");

  let fecha: Date;
  let horaStr: string;
  let fechaHoraDB: Date;

  // Argentina is UTC-3: store 09:00 Argentina as T12:00:00.000Z in DB
  // so browser in Argentina reads getHours()=9 correctly from the ISO string.
  const AR_OFFSET = 3;

  if (data.fechaStr && data.horaSlot) {
    const [y, m, d] = data.fechaStr.split("-").map(Number);
    const [h, min] = data.horaSlot.split(":").map(Number);
    fecha = new Date(y, m - 1, d);
    horaStr = data.horaSlot;
    fechaHoraDB = new Date(Date.UTC(y, m - 1, d, h + AR_OFFSET, min));
  } else {
    const fh = typeof data.fechaHora === "string" ? new Date(data.fechaHora) : data.fechaHora;
    fecha = new Date(fh.getUTCFullYear(), fh.getUTCMonth(), fh.getUTCDate());
    horaStr = `${String(fh.getUTCHours()).padStart(2, "0")}:${String(fh.getUTCMinutes()).padStart(2, "0")}`;
    fechaHoraDB = fh;
  }

  const modalidad = data.modalidad ?? "PRESENCIAL";

  const { getSlotDisponibles } = await import("@/lib/disponibilidad");

  const turno = await prisma.$transaction(async (tx) => {
    const slotsDisponibles = await getSlotDisponibles(fecha, servicio.duracion, false, modalidad);

    if (!slotsDisponibles.includes(horaStr)) {
      throw new Error("El horario seleccionado ya no está disponible. Por favor elegí otro.");
    }

    return tx.turno.create({
      data: {
        fechaHora: fechaHoraDB,
        clienteNombre: data.clienteNombre.slice(0, 100),
        clienteTelefono: data.clienteTelefono.slice(0, 30),
        clienteEmail: data.clienteEmail?.slice(0, 100) ?? null,
        observaciones: data.observaciones?.slice(0, 500) ?? null,
        modalidad,
        direccion: data.direccion?.slice(0, 200) ?? null,
        servicioId: data.servicioId,
        peluqueroId: data.peluqueroId ?? null,
        notas: data.notas?.slice(0, 500) ?? null,
        origen: data.origen ?? "ONLINE",
        descuentoAplicado: data.descuentoAplicado != null ? Math.max(0, Math.min(100, data.descuentoAplicado)) : null,
        duracionSnapshot: servicio.duracion,
        ...(data.productoIds?.length && data.productoIds.length <= 10
          ? { productos: { create: data.productoIds.map((id) => ({ productoId: id })) } }
          : {}),
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  return { ok: true, id: turno.id };
}

export async function actualizarEstadoTurno(id: string, estado: EstadoTurno) {
  await requireAdmin();
  if (estado === "COMPLETADO") {
    // Capturar snapshot de precios actuales antes de que puedan cambiar
    const turno = await prisma.turno.findUnique({
      where: { id },
      include: {
        servicio: { select: { nombre: true, precio: true } },
        productos: { include: { producto: { select: { nombre: true, ganancia: true } } } },
      },
    });

    if (turno) {
      // Guardar snapshot del servicio en el turno
      await prisma.turno.update({
        where: { id },
        data: {
          estado: "COMPLETADO",
          precioServicioFinal: turno.servicio.precio,
          nombreServicioFinal: turno.servicio.nombre,
        },
      });

      // Guardar snapshot de ganancia y nombre de cada producto
      if (turno.productos.length > 0) {
        await Promise.all(
          turno.productos.map((tp) =>
            prisma.turnoProducto.update({
              where: { id: tp.id },
              data: {
                gananciaFinal: tp.producto.ganancia,
                nombreProductoFinal: tp.producto.nombre,
              },
            })
          )
        );
      }
    }
  } else {
    await prisma.turno.update({ where: { id }, data: { estado } });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  revalidatePath("/admin/ganancias");
  revalidatePath("/admin/hoy");
}

export async function eliminarTurno(id: string) {
  await requireAdmin();
  await prisma.turno.update({ where: { id }, data: { estado: "CANCELADO" } });
  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
}
