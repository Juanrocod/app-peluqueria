import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Turno, Servicio } from "@prisma/client";

type TurnoHoy = Turno & { servicio: Servicio };

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE:  "Pendiente",
  CONFIRMADO: "Confirmado",
  COMPLETADO: "Completado",
  CANCELADO:  "Cancelado",
};

const ESTADO_STYLE: Record<string, { bar: string; badge: string }> = {
  PENDIENTE:  { bar: "bg-amber-500",   badge: "bg-amber-900/50 text-amber-300 border-amber-700/40" },
  CONFIRMADO: { bar: "bg-ap-primary",  badge: "bg-violet-900/50 text-ap-accent border-ap-border" },
  COMPLETADO: { bar: "bg-slate-600",   badge: "bg-slate-800/50 text-slate-400 border-slate-700/40" },
  CANCELADO:  { bar: "bg-red-700",     badge: "bg-red-900/50 text-red-400 border-red-800/40" },
};

export default function TodayView({
  turnos,
  slotsLibres,
  fecha,
}: {
  turnos: TurnoHoy[];
  slotsLibres: number;
  fecha: string;
}) {
  const [y, m, d] = fecha.split("-").map(Number);
  const fechaDate = new Date(y, m - 1, d);

  const confirmados = turnos.filter((t) => t.estado === "CONFIRMADO").length;
  const pendientes  = turnos.filter((t) => t.estado === "PENDIENTE").length;
  const ocupacion   =
    turnos.length + slotsLibres > 0
      ? Math.round((turnos.length / (turnos.length + slotsLibres)) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="border-b border-ap-border bg-ap-s2 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ap-accent">Hoy</p>
        <h1 className="mt-0.5 text-xl font-bold text-ap-text capitalize">
          {format(fechaDate, "EEEE d 'de' MMMM", { locale: es })}
        </h1>
        <p className="mt-0.5 text-sm text-ap-sub">
          {confirmados} confirmados · {pendientes} pendientes · {slotsLibres} libres
        </p>
      </div>

      {/* KPI chips */}
      <div className="flex gap-3 border-b border-ap-border px-4 py-3">
        {[
          { label: "Turnos",    value: turnos.length },
          { label: "Ocupación", value: `${ocupacion}%` },
          { label: "Libres",    value: slotsLibres },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-1 flex-col items-center rounded-xl border border-ap-border bg-ap-s1 py-3"
          >
            <span className="text-xl font-bold text-ap-accent">{value}</span>
            <span className="mt-0.5 text-[10px] text-ap-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Lista de turnos */}
      <div className="flex flex-col gap-2 overflow-auto px-4 py-3">
        {turnos.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-3xl">📅</p>
            <p className="text-sm text-ap-sub">Sin turnos para hoy</p>
          </div>
        )}
        {turnos.map((t) => {
          const styles = ESTADO_STYLE[t.estado] ?? ESTADO_STYLE.PENDIENTE;
          return (
            <div
              key={t.id}
              className="flex items-stretch gap-0 overflow-hidden rounded-xl border border-ap-border bg-ap-s1"
            >
              {/* Borde semántico izquierdo */}
              <div className={`w-1 shrink-0 ${styles.bar}`} />
              <div className="flex flex-1 items-center justify-between px-3 py-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-ap-text">{t.clienteNombre}</p>
                  <p className="text-xs text-ap-sub">{t.servicio.nombre}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="font-mono text-sm font-semibold text-ap-text"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {format(new Date(t.fechaHora), "HH:mm")}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${styles.badge}`}
                  >
                    {ESTADO_LABEL[t.estado]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
