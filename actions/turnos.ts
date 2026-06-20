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
  const servicio = await prisma.servicio.findUnique({ where: { id: data.servicioId } });
  if (!servicio) throw new Error("Servicio no encontrado");

  let fecha: Date;
  let horaStr: string;

  if (data.fechaStr && data.horaSlot) {
    const [y, m, d] = data.fechaStr.split("-").map(Number);
    fecha = new Date(y, m - 1, d);
    horaStr = data.horaSlot;
  } else {
    fecha = new Date(data.fechaHora.getFullYear(), data.fechaHora.getMonth(), data.fechaHora.getDate());
    horaStr = `${String(data.fechaHora.getHours()).padStart(2, "0")}:${String(data.fechaHora.getMinutes()).padStart(2, "0")}`;
  }

  const modalidad = data.modalidad ?? "PRESENCIAL";

  const { getSlotDisponibles } = await import("@/lib/disponibilidad");
  const slotsDisponibles = await getSlotDisponibles(fecha, servicio.duracion, false, modalidad);

  if (!slotsDisponibles.includes(horaStr)) {
    throw new Error("El horario seleccionado ya no está disponible. Por favor elegí otro.");
  }

  const turno = await prisma.turno.create({
    data: {
      fechaHora: data.fechaHora,
      clienteNombre: data.clienteNombre,
      clienteTelefono: data.clienteTelefono,
      clienteEmail: data.clienteEmail ?? null,
      observaciones: data.observaciones ?? null,
      modalidad,
      direccion: data.direccion ?? null,
      servicioId: data.servicioId,
      peluqueroId: data.peluqueroId ?? null,
      notas: data.notas ?? null,
      origen: data.origen ?? "ONLINE",
      descuentoAplicado: data.descuentoAplicado ?? null,
      duracionSnapshot: servicio.duracion,
      ...(data.productoIds?.length
        ? { productos: { create: data.productoIds.map((id) => ({ productoId: id })) } }
        : {}),
    },
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
