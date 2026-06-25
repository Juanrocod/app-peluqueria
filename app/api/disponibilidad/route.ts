import { NextRequest, NextResponse } from "next/server";
import { getSlotDisponibles, getSlotBase, getPremiumSlots } from "@/lib/disponibilidad";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fecha = searchParams.get("fecha");
  const servicioId = searchParams.get("servicioId");
  const servicioIds = searchParams.get("servicioIds");

  if (!fecha || (!servicioId && !servicioIds)) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  let duracionTotal: number;

  if (servicioIds) {
    // Multi-service: comma-separated IDs
    const ids = servicioIds.split(",").filter(Boolean);
    const servicios = await prisma.servicio.findMany({ where: { id: { in: ids } } });
    if (servicios.length !== ids.length) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    duracionTotal = servicios.reduce((sum, s) => sum + s.duracion, 0);
  } else {
    // Single service (backward compat)
    const servicio = await prisma.servicio.findUnique({ where: { id: servicioId! } });
    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    duracionTotal = servicio.duracion;
  }

  const [y, m, d] = fecha.split("-").map(Number);
  const fechaLocal = new Date(y, m - 1, d);

  const especial = searchParams.get("especial") === "1";
  const modalidad = searchParams.get("modalidad") === "DOMICILIO" ? "DOMICILIO" : "PRESENCIAL";

  const [slots, allSlots, premiumSlots] = await Promise.all([
    getSlotDisponibles(fechaLocal, duracionTotal, especial, modalidad),
    getSlotBase(fechaLocal, especial),
    getPremiumSlots(fechaLocal),
  ]);
  return NextResponse.json({ slots, allSlots, premiumSlots });
}
