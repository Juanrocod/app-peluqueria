"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EstadoTurno, OrigenTurno } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-guard";
import { crearTurnoSchema } from "@/lib/validations";
import { randomBytes } from "crypto";

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
  servicioId?: string;
  servicioIds?: string[];
  peluqueroId?: string;
  notas?: string;
  origen?: OrigenTurno;
  descuentoAplicado?: number;
  recargoPremium?: number;
  productoIds?: string[];
}) {
  const validated = crearTurnoSchema.parse(data);

  try {
    const { bookingLimiter } = await import("@/lib/rate-limit");
    const { success } = await bookingLimiter.limit(validated.clienteTelefono || "anon");
    if (!success) throw new Error("Demasiados intentos. Esperá un momento.");
  } catch (e) { if (e instanceof Error && e.message.includes("Demasiados")) throw e; }

  // Resolve service IDs: prefer servicioIds array, fallback to single servicioId
  const resolvedIds: string[] = validated.servicioIds?.length
    ? validated.servicioIds
    : validated.servicioId
      ? [validated.servicioId]
      : [];
  if (resolvedIds.length === 0) throw new Error("Debe seleccionar al menos un servicio");

  const servicios = await prisma.servicio.findMany({
    where: { id: { in: resolvedIds } },
  });
  if (servicios.length !== resolvedIds.length) throw new Error("Servicio no encontrado");

  const duracionTotal = servicios.reduce((sum, s) => sum + s.duracion, 0);
  const primaryServiceId = resolvedIds[0];

  let fecha: Date;
  let horaStr: string;
  let fechaHoraDB: Date;

  // Argentina is UTC-3: store 09:00 Argentina as T12:00:00.000Z in DB
  // so browser in Argentina reads getHours()=9 correctly from the ISO string.
  const AR_OFFSET = 3;

  if (validated.fechaStr && validated.horaSlot) {
    const [y, m, d] = validated.fechaStr.split("-").map(Number);
    const [h, min] = validated.horaSlot.split(":").map(Number);
    fecha = new Date(y, m - 1, d);
    horaStr = validated.horaSlot;
    fechaHoraDB = new Date(Date.UTC(y, m - 1, d, h + AR_OFFSET, min));
  } else {
    const fh = typeof validated.fechaHora === "string" ? new Date(validated.fechaHora) : validated.fechaHora;
    fecha = new Date(fh.getUTCFullYear(), fh.getUTCMonth(), fh.getUTCDate());
    horaStr = `${String(fh.getUTCHours()).padStart(2, "0")}:${String(fh.getUTCMinutes()).padStart(2, "0")}`;
    fechaHoraDB = fh;
  }

  const modalidad = validated.modalidad ?? "PRESENCIAL";

  const { getSlotDisponibles } = await import("@/lib/disponibilidad");

  const cancelToken = randomBytes(16).toString("hex");

  const turno = await prisma.$transaction(async (tx) => {
    const slotsDisponibles = await getSlotDisponibles(fecha, duracionTotal, false, modalidad);

    if (!slotsDisponibles.includes(horaStr)) {
      throw new Error("El horario seleccionado ya no está disponible. Por favor elegí otro.");
    }

    return tx.turno.create({
      data: {
        fechaHora: fechaHoraDB,
        clienteNombre: validated.clienteNombre.slice(0, 100),
        clienteTelefono: validated.clienteTelefono.slice(0, 30),
        clienteEmail: validated.clienteEmail?.slice(0, 100) ?? null,
        observaciones: validated.observaciones?.slice(0, 500) ?? null,
        modalidad,
        direccion: validated.direccion?.slice(0, 200) ?? null,
        servicioId: primaryServiceId,
        peluqueroId: validated.peluqueroId ?? null,
        notas: validated.notas?.slice(0, 500) ?? null,
        origen: validated.origen ?? "ONLINE",
        cancelToken,
        descuentoAplicado: await (async () => {
          if (!validated.descuentoAplicado) return null;
          const codigo = await prisma.codigoDescuento.findFirst({ where: { activo: true, descuento: validated.descuentoAplicado } });
          return codigo ? codigo.descuento : null;
        })(),
        duracionSnapshot: duracionTotal,
        recargoPremium: validated.recargoPremium ?? null,
        servicios: {
          create: servicios.map((s) => ({
            servicioId: s.id,
            duracionSnapshot: s.duracion,
          })),
        },
        ...(validated.productoIds?.length && validated.productoIds.length <= 10
          ? { productos: { create: validated.productoIds.map((id) => ({ productoId: id })) } }
          : {}),
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/turnos");
  revalidatePath("/admin/hoy");

  try {
    const { sendPushToAll } = await import("@/lib/push");
    const svcNames = servicios.map((s) => s.nombre).join(", ");
    await sendPushToAll(
      "Nuevo turno",
      `${validated.clienteNombre} · ${svcNames} · ${horaStr}`,
      "/admin/turnos",
    );
  } catch {}

  // Send cancel link via email if client provided email and Resend is configured
  if (validated.clienteEmail && process.env.RESEND_API_KEY) {
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXTAUTH_URL || "http://localhost:3000";
      const cancelUrl = `${baseUrl}/mi-turno/${turno.cancelToken}`;
      const svcNames = servicios.map((s) => s.nombre).join(", ");
      const fechaDisplay = fecha.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "BarberFras <onboarding@resend.dev>",
        to: validated.clienteEmail,
        subject: "Tu turno fue reservado",
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:#131313;padding:10px 20px;border-radius:12px;">
                <span style="font-size:20px;font-weight:bold;color:#ffffff;">&#9986; BarberFras</span>
              </div>
            </div>
            <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 12px;text-align:center;">Tu turno fue reservado</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;text-align:center;">Hola ${validated.clienteNombre}, tu turno quedó confirmado.</p>
            <div style="background:#f0f4ff;border:1px solid #d0dbf0;border-radius:10px;padding:16px;margin:20px 0;">
              <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Servicio:</strong> ${svcNames}</p>
              <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Fecha:</strong> ${fechaDisplay}</p>
              <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Hora:</strong> ${horaStr}</p>
              <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Modalidad:</strong> ${modalidad === "DOMICILIO" ? "A domicilio" : "En el local"}</p>
            </div>
            <p style="color:#555;font-size:14px;line-height:1.6;text-align:center;">Si necesitás cancelar tu turno, usá el siguiente link (hasta 2 horas antes):</p>
            <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:20px 0;word-break:break-all;text-align:center;">
              <a href="${cancelUrl}" style="font-size:13px;color:#2F6BFF;font-weight:bold;text-decoration:underline;">${cancelUrl}</a>
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#999;font-size:12px;text-align:center;">Podés cancelar hasta 2 horas antes del turno.</p>
          </div>
        `,
      });
    } catch {
      // Email send failure should not break the booking flow
    }
  }

  return { ok: true, id: turno.id, cancelToken: turno.cancelToken };
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
        servicios: { include: { servicio: { select: { nombre: true, precio: true } } } },
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

      // Guardar snapshot de precio y nombre en cada TurnoServicio
      if (turno.servicios.length > 0) {
        await Promise.all(
          turno.servicios.map((ts) =>
            prisma.turnoServicio.update({
              where: { id: ts.id },
              data: {
                precioSnapshot: ts.servicio.precio,
                nombreSnapshot: ts.servicio.nombre,
              },
            })
          )
        );
      }

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
