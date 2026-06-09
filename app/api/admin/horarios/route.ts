import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoFranja } from "@prisma/client";

const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

type NuevoTipo = "POSITIVA" | "NEGATIVA" | "eliminar";

type Cambio = {
  diaSemana: number;
  hora: string;
  nuevoTipo: NuevoTipo;
};

function validarBody(body: unknown): { cambios: Cambio[]; granularidad: 30 | 60 } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const granularidad = b.granularidad;
  if (granularidad !== 30 && granularidad !== 60) return null;

  const cambios = b.cambios;
  if (!Array.isArray(cambios) || cambios.length === 0 || cambios.length > 500) return null;

  for (const c of cambios) {
    if (!c || typeof c !== "object") return null;
    const { diaSemana, hora, nuevoTipo } = c as Record<string, unknown>;
    if (typeof diaSemana !== "number" || !Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) return null;
    if (typeof hora !== "string" || !HORA_RE.test(hora)) return null;
    if (nuevoTipo !== "POSITIVA" && nuevoTipo !== "NEGATIVA" && nuevoTipo !== "eliminar") return null;
  }

  return { cambios: cambios as Cambio[], granularidad: granularidad as 30 | 60 };
}

// POST /api/admin/horarios
// Persiste los cambios de la grilla en HorarioAtencion.
// Cada cambio corresponde a una celda (diaSemana + hora de inicio del slot).
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const data = validarBody(body);
  if (!data) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 422 });
  }

  const { cambios, granularidad } = data;

  // Agrupa los cambios por diaSemana para procesarlos en bloques
  const porDia = new Map<number, typeof cambios>();
  for (const c of cambios) {
    if (!porDia.has(c.diaSemana)) porDia.set(c.diaSemana, []);
    porDia.get(c.diaSemana)!.push(c);
  }

  // Para cada día, recalcula las franjas resultantes y las persiste
  await prisma.$transaction(async (tx) => {
    for (const [diaSemana, slots] of porDia.entries()) {
      // Carga franjas existentes del día
      const existentes = await tx.horarioAtencion.findMany({
        where: { diaSemana, activo: true },
        orderBy: { horaApertura: "asc" },
      });

      for (const slot of slots) {
        const horaFin = calcularHoraFin(slot.hora, granularidad);

        if (slot.nuevoTipo === "eliminar") {
          // Desactiva el registro NEGATIVA exacto que bloquea este slot
          const negativaExacta = existentes.find(
            (h) => h.horaApertura === slot.hora && h.horaCierre === horaFin && h.tipoFranja === "NEGATIVA"
          );
          if (negativaExacta) {
            await tx.horarioAtencion.update({
              where: { id: negativaExacta.id },
              data: { activo: false },
            });
          }
          continue;
        }

        const tipo: TipoFranja = slot.nuevoTipo as TipoFranja;

        // Busca si ya existe un HorarioAtencion para este slot exacto
        const existente = existentes.find(
          (h) => h.horaApertura === slot.hora && h.horaCierre === horaFin && h.tipoFranja === tipo
        );

        if (existente) {
          // Ya existe con ese tipo: reactivar si estaba inactivo
          if (!existente.activo) {
            await tx.horarioAtencion.update({
              where: { id: existente.id },
              data: { activo: true },
            });
          }
        } else {
          // Crear nuevo registro de franja para este slot
          await tx.horarioAtencion.create({
            data: {
              diaSemana,
              horaApertura: slot.hora,
              horaCierre: horaFin,
              tipoFranja: tipo,
              esBloqueo: tipo === "NEGATIVA", // retrocompat.
              activo: true,
            },
          });
        }
      }
    }
  });

  return NextResponse.json({ ok: true });
}

function calcularHoraFin(hora: string, granularidad: number): string {
  const [h, m] = hora.split(":").map(Number);
  const totalMin = h * 60 + m + granularidad;
  const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
