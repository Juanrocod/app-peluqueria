import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Scissors, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import CancelButton from "@/components/booking/CancelButton";

export const dynamic = "force-dynamic";

export default async function MiTurnoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length !== 32) {
    notFound();
  }

  const turno = await prisma.turno.findFirst({
    where: { cancelToken: token },
    include: {
      servicio: { select: { nombre: true } },
      servicios: { include: { servicio: { select: { nombre: true } } } },
    },
  });

  if (!turno) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "#0C1322" }}>
        <div className="w-full max-w-md rounded-2xl border p-8 text-center" style={{ background: "#16213A", borderColor: "#2A3A5E" }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(242,97,87,.15)" }}>
            <XCircle size={28} color="#F26157" />
          </div>
          <h1 className="font-display text-xl font-bold text-white">Turno no encontrado</h1>
          <p className="mt-2 text-sm" style={{ color: "#9DA9C0" }}>
            El link es incorrecto o el turno ya no existe.
          </p>
        </div>
      </div>
    );
  }

  const svcNames =
    turno.servicios.length > 0
      ? turno.servicios.map((ts) => ts.servicio.nombre).join(", ")
      : turno.servicio.nombre;

  const tz = "America/Argentina/Buenos_Aires";
  const fechaDisplay = turno.fechaHora.toLocaleDateString("es-AR", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const horaDisplay = turno.fechaHora.toLocaleTimeString("es-AR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isCancelled = turno.estado === "CANCELADO";
  const isCompleted = turno.estado === "COMPLETADO";
  const msUntilTurno = turno.fechaHora.getTime() - Date.now();
  const twoHoursMs = 2 * 60 * 60 * 1000;
  const canCancel = !isCancelled && !isCompleted && msUntilTurno > twoHoursMs;
  const tooLate = !isCancelled && !isCompleted && msUntilTurno <= twoHoursMs;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8" style={{ background: "#0C1322" }}>
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border"
        style={{ background: "#16213A", borderColor: "#2A3A5E", boxShadow: "0 24px 60px -28px rgba(0,0,0,.8)" }}
      >
        {/* Header */}
        <div
          className="px-6 py-7 text-center"
          style={{
            background: isCancelled
              ? "linear-gradient(160deg, #7A1B1B, #6B0E0E)"
              : isCompleted
                ? "linear-gradient(160deg, #1B7A53, #0E6B47)"
                : "linear-gradient(160deg, #1a1a2e, #16213e)",
          }}
        >
          <div className="mx-auto mb-3 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white/20">
            <Scissors size={28} color="#fff" />
          </div>
          <div className="font-display text-[25px] font-bold text-white">BarberFras</div>
          <div className="mt-1 text-sm text-white/85">Tu turno</div>
        </div>

        {/* Turno details */}
        <div className="space-y-0 px-5 pb-5">
          {/* Service */}
          <div className="flex gap-3 border-b py-3.5" style={{ borderColor: "#2A3A5E" }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border" style={{ borderColor: "#2A3A5E", background: "#1A2742" }}>
              <Scissors size={18} color="#7C9CFF" />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5F6B85" }}>
                {turno.servicios.length > 1 ? "SERVICIOS" : "SERVICIO"}
              </div>
              <div className="mt-0.5 text-[15px] font-bold text-white">{svcNames}</div>
            </div>
          </div>

          {/* Date */}
          <div className="flex gap-3 border-b py-3.5" style={{ borderColor: "#2A3A5E" }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border" style={{ borderColor: "#2A3A5E", background: "#1A2742" }}>
              <Calendar size={18} color="#7C9CFF" />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5F6B85" }}>FECHA</div>
              <div className="mt-0.5 text-[15px] font-bold text-white capitalize">{fechaDisplay}</div>
            </div>
          </div>

          {/* Time */}
          <div className="flex gap-3 border-b py-3.5" style={{ borderColor: "#2A3A5E" }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border" style={{ borderColor: "#2A3A5E", background: "#1A2742" }}>
              <Clock size={18} color="#7C9CFF" />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5F6B85" }}>HORA</div>
              <div className="mt-0.5 font-mono-num text-[15px] font-bold text-white">{horaDisplay}</div>
            </div>
          </div>

          {/* Modality */}
          <div className="flex gap-3 border-b py-3.5" style={{ borderColor: "#2A3A5E" }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border" style={{ borderColor: "#2A3A5E", background: "#1A2742" }}>
              <MapPin size={18} color="#7C9CFF" />
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5F6B85" }}>UBICACIÓN</div>
              <div className="mt-0.5 text-[15px] font-bold text-white">
                {turno.modalidad === "DOMICILIO" ? "A domicilio" : "En el local"}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-3 py-3.5" style={{ borderColor: "#2A3A5E" }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border" style={{ borderColor: "#2A3A5E", background: "#1A2742" }}>
              {isCancelled ? (
                <XCircle size={18} color="#F26157" />
              ) : isCompleted ? (
                <CheckCircle size={18} color="#22D366" />
              ) : (
                <CheckCircle size={18} color="#7C9CFF" />
              )}
            </span>
            <div>
              <div className="text-[11px] font-bold tracking-wider" style={{ color: "#5F6B85" }}>ESTADO</div>
              <div
                className="mt-0.5 text-[15px] font-bold"
                style={{
                  color: isCancelled ? "#F26157" : isCompleted ? "#22D366" : "#E4E8F0",
                }}
              >
                {isCancelled
                  ? "Cancelado"
                  : isCompleted
                    ? "Completado"
                    : turno.estado === "CONFIRMADO"
                      ? "Confirmado"
                      : "Pendiente"}
              </div>
            </div>
          </div>

          {/* Action area */}
          <div className="pt-3">
            {isCancelled && (
              <div className="flex items-center gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: "rgba(242,97,87,.3)", background: "rgba(242,97,87,.08)" }}>
                <XCircle size={18} color="#F26157" />
                <span className="text-sm font-semibold" style={{ color: "#F26157" }}>
                  Este turno fue cancelado
                </span>
              </div>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: "rgba(34,211,102,.3)", background: "rgba(34,211,102,.08)" }}>
                <CheckCircle size={18} color="#22D366" />
                <span className="text-sm font-semibold" style={{ color: "#22D366" }}>
                  Este turno ya fue realizado
                </span>
              </div>
            )}

            {tooLate && (
              <div className="flex items-center gap-2.5 rounded-xl border px-3.5 py-3" style={{ borderColor: "rgba(232,163,61,.3)", background: "rgba(232,163,61,.08)" }}>
                <AlertTriangle size={18} color="#E8A33D" />
                <span className="text-sm font-semibold" style={{ color: "#E8A33D" }}>
                  Ya no se puede cancelar, contact&aacute; a la peluquer&iacute;a
                </span>
              </div>
            )}

            {canCancel && <CancelButton token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
}
