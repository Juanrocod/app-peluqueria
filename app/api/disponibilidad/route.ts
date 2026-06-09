import { NextRequest, NextResponse } from "next/server";
import { getSlotDisponibles } from "@/lib/disponibilidad";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fecha = searchParams.get("fecha");
  const servicioId = searchParams.get("servicioId");

  if (!fecha || !servicioId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  const [y, m, d] = fecha.split("-").map(Number);
  const fechaLocal = new Date(y, m - 1, d);

  const especial = searchParams.get("especial") === "1";
  const modalidad = searchParams.get("modalidad") === "DOMICILIO" ? "DOMICILIO" : "PRESENCIAL";

  const slots = await getSlotDisponibles(fechaLocal, servicio.duracion, especial, modalidad);
  return NextResponse.json({ slots });
}
