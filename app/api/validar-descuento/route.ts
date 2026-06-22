import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get("codigo");
  if (!codigo) return NextResponse.json({ valido: false });

  try {
    const { discountLimiter } = await import("@/lib/rate-limit");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
    const { success } = await discountLimiter.limit(ip);
    if (!success) return NextResponse.json({ valido: false });
  } catch {}

  const descuento = await prisma.codigoDescuento.findFirst({
    where: { codigo: codigo.toUpperCase(), activo: true },
  });

  if (!descuento) return NextResponse.json({ valido: false });

  return NextResponse.json({ valido: true, porcentaje: descuento.descuento });
}
