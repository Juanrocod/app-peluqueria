import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  addMinutes,
  format,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  startOfToday,
  isBefore,
} from "date-fns";

const BUFFER_DOMICILIO = 40;
const GRANULARIDAD_SLOT = 30;

// GET /api/disponibilidad/mes?mes=2026-06&servicioId=X&modalidad=PRESENCIAL
// Devuelve los días del mes que tienen al menos 1 slot disponible.
// Hace 3 queries a la DB para todo el mes (eficiente).
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mesParam = searchParams.get("mes"); // "YYYY-MM"
  const servicioId = searchParams.get("servicioId");
  const modalidadParam = searchParams.get("modalidad");
  const modalidad: "PRESENCIAL" | "DOMICILIO" =
    modalidadParam === "DOMICILIO" ? "DOMICILIO" : "PRESENCIAL";

  if (!mesParam || !servicioId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const [year, month] = mesParam.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: "Mes inválido" }, { status: 400 });
  }

  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  const duracion = servicio.duracion;
  const durEfectiva =
    modalidad === "DOMICILIO" ? duracion + BUFFER_DOMICILIO * 2 : duracion;

  const primerDia = new Date(year, month - 1, 1);
  const ultimoDia = new Date(year, month, 0); // último día del mes

  // ── 3 queries para todo el mes ──────────────────────────────────────────────

  const [horarios, turnosMes, bloqueosMes] = await Promise.all([
    // Capa 1 y 2: todas las franjas activas de todos los días de semana
    prisma.horarioAtencion.findMany({ where: { activo: true } }),
    // Turnos no cancelados del mes
    prisma.turno.findMany({
      where: {
        fechaHora: { gte: startOfDay(primerDia), lte: endOfDay(ultimoDia) },
        estado: { notIn: ["CANCELADO"] },
      },
      include: { servicio: true },
    }),
    // Capa 3: bloqueos puntuales del mes (usando Date.UTC para alinear con @db.Date)
    prisma.bloqueoHorario.findMany({
      where: {
        fecha: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lt: new Date(Date.UTC(year, month, 1)),
        },
      },
    }),
  ]);

  const franjasPositivas = horarios.filter((h) => h.tipoFranja === "POSITIVA");
  const franjasNegativas = horarios.filter((h) => h.tipoFranja === "NEGATIVA");
  const hoy = startOfToday();

  const diasDisponibles: string[] = [];

  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const fecha = new Date(year, month - 1, d);
    if (isBefore(fecha, hoy)) continue; // días pasados siempre no disponibles

    const diaSemana = fecha.getDay();
    const fechaStr = format(fecha, "yyyy-MM-dd");

    // Capa 1: ¿hay franjas positivas para este día de semana?
    const positivasDelDia = franjasPositivas.filter(
      (h) => h.diaSemana === diaSemana
    );
    if (positivasDelDia.length === 0) continue;

    // Capa 2: NEGATIVAs activas para este día de semana
    const negativasDelDia = franjasNegativas.filter(
      (h) => h.diaSemana === diaSemana
    );

    // Capa 3: bloqueos puntuales para esta fecha exacta
    const fechaUTC = new Date(Date.UTC(year, month - 1, d));
    const bloqueosDelDia = bloqueosMes.filter(
      (b) =>
        b.fecha.getTime() >= fechaUTC.getTime() &&
        b.fecha.getTime() < fechaUTC.getTime() + 86_400_000
    );

    // Atajo: bloqueo de día completo
    if (bloqueosDelDia.some((b) => b.todoElDia)) continue;

    // Turnos del día
    const turnosDelDia = turnosMes.filter((t) => isSameDay(t.fechaHora, fecha));

    // Busca el primer slot libre — sale en cuanto encuentra uno
    const base = startOfDay(fecha);
    let hasSlot = false;

    outer: for (const franja of positivasDelDia) {
      const [aH, aM] = franja.horaApertura.split(":").map(Number);
      const [cH, cM] = franja.horaCierre.split(":").map(Number);
      const inicio = setMinutes(setHours(base, aH), aM);
      const fin = setMinutes(setHours(base, cH), cM);

      let cursor = inicio;
      while (addMinutes(cursor, duracion) <= fin) {
        const slotInicio =
          modalidad === "DOMICILIO" ? addMinutes(cursor, -BUFFER_DOMICILIO) : cursor;
        const slotFin = addMinutes(slotInicio, durEfectiva);

        const porNeg = negativasDelDia.some((b) => {
          const bI = parseISO(`${fechaStr}T${b.horaApertura}`);
          const bF = parseISO(`${fechaStr}T${b.horaCierre}`);
          return cursor < bF && addMinutes(cursor, duracion) > bI;
        });
        if (!porNeg) {
          const porBloqueo = bloqueosDelDia.some((b) => {
            const bI = parseISO(`${fechaStr}T${b.horaInicio}`);
            const bF = parseISO(`${fechaStr}T${b.horaFin}`);
            return slotInicio < bF && slotFin > bI;
          });
          if (!porBloqueo) {
            const ocupado = turnosDelDia.some((t) => {
              const tMod = t.modalidad ?? "PRESENCIAL";
              const buf = tMod === "DOMICILIO" ? BUFFER_DOMICILIO : 0;
              const tI = addMinutes(t.fechaHora, -buf);
              const tF = addMinutes(t.fechaHora, t.servicio.duracion + buf);
              return slotInicio < tF && slotFin > tI;
            });
            if (!ocupado) {
              hasSlot = true;
              break outer;
            }
          }
        }
        cursor = addMinutes(cursor, GRANULARIDAD_SLOT);
      }
    }

    if (hasSlot) diasDisponibles.push(fechaStr);
  }

  return NextResponse.json({ diasDisponibles });
}
