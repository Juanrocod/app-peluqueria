import { prisma } from "@/lib/prisma";
import { addMinutes, format, parseISO, setHours, setMinutes, startOfDay, endOfDay } from "date-fns";

const BUFFER_DOMICILIO = 40;
const GRANULARIDAD_SLOT = 30;
const AR_OFFSET_MS = 3 * 60 * 60 * 1000;

export async function getSlotDisponibles(
  fecha: Date,
  duracionMinutos: number,
  incluirEspecial = false,
  modalidad: "PRESENCIAL" | "DOMICILIO" = "PRESENCIAL"
): Promise<string[]> {
  const diaSemana = fecha.getDay();

  // Capa 1 — Franjas positivas base
  const franjas = await prisma.horarioAtencion.findMany({
    where: {
      diaSemana,
      activo: true,
      tipoFranja: "POSITIVA",
      ...(incluirEspecial ? {} : { etiqueta: null }),
    },
    orderBy: { horaApertura: "asc" },
  });

  if (franjas.length === 0) return [];

  // Capa 2 — Franjas negativas recurrentes
  const franjasNegativas = await prisma.horarioAtencion.findMany({
    where: { diaSemana, activo: true, tipoFranja: "NEGATIVA" },
  });

  const base = startOfDay(fecha);

  // Generar slots sin duplicados (pueden haber sub-franjas redundantes en la DB)
  const seen = new Set<number>();
  const todosLosSlots: Date[] = [];
  for (const franja of franjas) {
    const [aH, aM] = franja.horaApertura.split(":").map(Number);
    const [cH, cM] = franja.horaCierre.split(":").map(Number);
    const inicio = setMinutes(setHours(base, aH), aM);
    const fin = setMinutes(setHours(base, cH), cM);

    let cursor = inicio;
    while (addMinutes(cursor, duracionMinutos) <= fin) {
      const ts = cursor.getTime();
      if (!seen.has(ts)) {
        seen.add(ts);
        todosLosSlots.push(cursor);
      }
      cursor = addMinutes(cursor, GRANULARIDAD_SLOT);
    }
  }

  // Capa 3 — Bloqueos puntuales: @db.Date se guarda como medianoche UTC,
  // así que igualamos contra la medianoche UTC del día local solicitado.
  const fechaUTC = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const bloqueosPuntuales = await prisma.bloqueoHorario.findMany({
    where: {
      fecha: {
        gte: fechaUTC,
        lt: new Date(fechaUTC.getTime() + 86400000), // +24h
      },
    },
  });

  // Turnos confirmados o pendientes ese día
  // Extend 3h past midnight to catch turnos stored with AR offset (21:00 AR = 00:00 UTC+1)
  const turnosDelDia = await prisma.turno.findMany({
    where: {
      fechaHora: { gte: startOfDay(fecha), lte: new Date(endOfDay(fecha).getTime() + 3 * 60 * 60 * 1000) },
      estado: { notIn: ["CANCELADO"] },
    },
    select: { fechaHora: true, modalidad: true, duracionSnapshot: true, servicio: { select: { duracion: true } } },
  });

  const durEfectiva = modalidad === "DOMICILIO"
    ? duracionMinutos + BUFFER_DOMICILIO * 2
    : duracionMinutos;

  const slotsLibres = todosLosSlots.filter((slot) => {
    const slotInicio = modalidad === "DOMICILIO" ? addMinutes(slot, -BUFFER_DOMICILIO) : slot;
    const slotFin = addMinutes(slotInicio, durEfectiva);

    // Verificar Capa 2
    const bloqueadoPorNegativa = franjasNegativas.some((b) => {
      const bInicio = parseISO(`${format(fecha, "yyyy-MM-dd")}T${b.horaApertura}`);
      const bFin = parseISO(`${format(fecha, "yyyy-MM-dd")}T${b.horaCierre}`);
      return slot < bFin && addMinutes(slot, duracionMinutos) > bInicio;
    });
    if (bloqueadoPorNegativa) return false;

    // Verificar Capa 3
    const bloqueadoPuntual = bloqueosPuntuales.some((b) => {
      if (b.todoElDia) return true;
      const bInicio = parseISO(`${format(fecha, "yyyy-MM-dd")}T${b.horaInicio}`);
      const bFin = parseISO(`${format(fecha, "yyyy-MM-dd")}T${b.horaFin}`);
      return slotInicio < bFin && slotFin > bInicio;
    });
    if (bloqueadoPuntual) return false;

    // Verificar turnos existentes
    // Turnos are stored with AR offset (9:00 AR = T12:00Z), slots are in server-local time.
    // Subtract offset to align turno times with slot times for comparison.
    const ocupado = turnosDelDia.some((t) => {
      const tModalidad = t.modalidad ?? "PRESENCIAL";
      const bufferT = tModalidad === "DOMICILIO" ? BUFFER_DOMICILIO : 0;
      const tLocal = new Date(t.fechaHora.getTime() - AR_OFFSET_MS);
      const durReal = t.duracionSnapshot ?? t.servicio.duracion;
      const tInicio = addMinutes(tLocal, -bufferT);
      const tFin = addMinutes(tLocal, durReal + bufferT);
      return slotInicio < tFin && slotFin > tInicio;
    });

    return !ocupado;
  });

  return slotsLibres.map((s) => format(s, "HH:mm"));
}

export async function getSlotBase(
  fecha: Date,
  incluirEspecial = false,
): Promise<string[]> {
  const diaSemana = fecha.getDay();
  const franjas = await prisma.horarioAtencion.findMany({
    where: {
      diaSemana,
      activo: true,
      tipoFranja: "POSITIVA",
      ...(incluirEspecial ? {} : { etiqueta: null }),
    },
    orderBy: { horaApertura: "asc" },
  });
  const base = startOfDay(fecha);
  const seen = new Set<number>();
  const slots: Date[] = [];
  for (const franja of franjas) {
    const [aH, aM] = franja.horaApertura.split(":").map(Number);
    const [cH, cM] = franja.horaCierre.split(":").map(Number);
    const inicio = setMinutes(setHours(base, aH), aM);
    const fin = setMinutes(setHours(base, cH), cM);
    let cursor = inicio;
    while (cursor < fin) {
      const ts = cursor.getTime();
      if (!seen.has(ts)) {
        seen.add(ts);
        slots.push(cursor);
      }
      cursor = addMinutes(cursor, 30);
    }
  }
  return slots.map((s) => format(s, "HH:mm"));
}
