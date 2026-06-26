"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, CheckCircle, Circle } from "lucide-react";
import { actualizarEstadoTurno } from "@/actions/turnos";

type SerializedTurno = {
  id: string;
  fechaHora: string;
  clienteNombre: string;
  clienteTelefono: string;
  observaciones: string | null;
  modalidad: string;
  direccion: string | null;
  estado: string;
  servicio: { nombre: string; duracion: number; precio: number };
  productos: { nombre: string }[];
  servicios: { nombre: string; duracion: number; precio: number }[];
};

const STATUS_BORDER: Record<string, string> = {
  PENDIENTE:  "#E8A33D",
  CONFIRMADO: "#2F6BFF",
  CANCELADO:  "#F26157",
  COMPLETADO: "#22D366",
};

const MESES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];
const DIAS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

function money(n: number) {
  return "$" + n.toLocaleString("es-AR");
}

function toAR(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getHourAR(iso: string) {
  return parseInt(
    new Date(iso).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      hour12: false,
    }),
    10
  );
}

export function DesktopHoyClient({
  turnos,
  slotsTotal,
  fecha,
}: {
  turnos: SerializedTurno[];
  slotsTotal: number;
  fecha: string; // "YYYY-MM-DD"
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [y, m, d] = fecha.split("-").map(Number);
  const fechaDate = new Date(y, m - 1, d);
  const fechaLabel = `${DIAS[fechaDate.getDay()]} ${d} de ${MESES[m - 1]}`;

  const total = turnos.length;
  const doneCount = turnos.filter((t) => t.estado === "COMPLETADO").length;
  const free = Math.max(0, slotsTotal - total);
  const occ = slotsTotal > 0 ? Math.round((total / slotsTotal) * 100) : 0;

  const gTotal = turnos.reduce((a, t) => {
    const base = t.servicios.length > 0
      ? t.servicios.reduce((s, sv) => s + sv.precio, 0)
      : t.servicio.precio;
    return a + base;
  }, 0);

  const gDone = turnos
    .filter((t) => t.estado === "COMPLETADO")
    .reduce((a, t) => {
      const base = t.servicios.length > 0
        ? t.servicios.reduce((s, sv) => s + sv.precio, 0)
        : t.servicio.precio;
      return a + base;
    }, 0);

  const pending = turnos.filter((t) => t.estado !== "COMPLETADO" && t.estado !== "CANCELADO");
  const nextTurno = pending[0] ?? null;

  const morning = turnos.filter((t) => getHourAR(t.fechaHora) < 13);
  const afternoon = turnos.filter((t) => getHourAR(t.fechaHora) >= 13);

  function handleComplete(id: string) {
    startTransition(async () => {
      await actualizarEstadoTurno(id, "COMPLETADO");
      router.refresh();
    });
  }

  function TurnoRow({ t }: { t: SerializedTurno }) {
    const isDone = t.estado === "COMPLETADO";
    const isCancelled = t.estado === "CANCELADO";
    const svcName = t.servicios.length > 0
      ? t.servicios.map((s) => s.nombre).join(", ")
      : t.servicio.nombre;
    const svcPrice = t.servicios.length > 0
      ? t.servicios.reduce((a, s) => a + s.precio, 0)
      : t.servicio.precio;
    const svcDur = t.servicios.length > 0
      ? t.servicios.reduce((a, s) => a + s.duracion, 0)
      : t.servicio.duracion;

    return (
      <div
        className="flex items-center gap-4 rounded-xl border border-ap-border-soft bg-ap-s1 px-4 py-3"
        style={{
          borderLeft: `3px solid ${STATUS_BORDER[t.estado] ?? "#6F6F73"}`,
          opacity: isCancelled ? 0.5 : 1,
        }}
      >
        <button
          disabled={isDone || isCancelled || isPending}
          onClick={() => handleComplete(t.id)}
          className="shrink-0 disabled:opacity-40 transition-opacity"
          aria-label="Marcar completado"
          style={{ color: isDone ? "#22D366" : "#6F6F73" }}
        >
          {isDone ? <CheckCircle size={22} /> : <Circle size={22} />}
        </button>

        <span className="w-14 shrink-0 font-mono text-[15px] font-semibold text-ap-text">
          {toAR(t.fechaHora)}
        </span>

        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold ${isDone ? "line-through text-ap-muted" : "text-ap-text"}`}>
            {t.clienteNombre}
          </div>
          <div className="text-xs text-ap-sub truncate">{svcName}</div>
        </div>

        <span className="hidden lg:block w-16 shrink-0 text-right text-xs text-ap-muted">
          {svcDur} min
        </span>

        <span className={`w-24 shrink-0 text-right font-mono text-sm font-semibold ${isDone ? "text-[#22D366]" : "text-ap-text"}`}>
          {money(svcPrice)}
        </span>

        {t.modalidad === "DOMICILIO" && (
          <span className="hidden xl:block shrink-0 rounded-full bg-[rgba(232,163,61,.15)] px-2 py-0.5 text-[11px] font-semibold text-[#E8A33D]">
            Domicilio
          </span>
        )}
      </div>
    );
  }

  function Section({ label, icon, items }: { label: string; icon: React.ReactNode; items: SerializedTurno[] }) {
    if (items.length === 0) return null;
    return (
      <section>
        <div className="mb-2 flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-wider text-ap-muted">{label}</span>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((t) => <TurnoRow key={t.id} t={t} />)}
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize text-ap-text">{fechaLabel}</h1>
          <p className="mt-1 text-sm text-ap-muted">
            <span className="font-mono" style={{ color: "#22D366" }}>{doneCount}</span>
            <span> / {total} realizados</span>
          </p>
        </div>
        <div className="text-right">
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-ap-muted">Ocupación</div>
          <div className="text-3xl font-bold" style={{ color: occ >= 70 ? "#34D399" : "#E8A33D" }}>
            {occ}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-ap-s2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${occ}%`, background: occ >= 70 ? "#22D366" : "#E8A33D" }}
        />
      </div>

      {/* Stats chips */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Turnos",        value: String(total),       color: "#ADADB0" },
          { label: "Libres",        value: String(free),        color: "#ADADB0" },
          { label: "Ganancia est.", value: money(gTotal),       color: "#2F6BFF" },
          { label: "Realizado",     value: money(gDone),        color: "#22D366" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-ap-border-soft bg-ap-s1 px-4 py-3"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ap-muted">{label}</div>
            <div className="mt-1 font-mono text-lg font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Próximo banner */}
      {nextTurno && (
        <div className="flex items-center gap-3 rounded-xl border border-[#1B3D5F] bg-[rgba(47,107,255,.08)] px-4 py-3">
          <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#2F6BFF]" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B9AFF]">Próximo turno</div>
            <div className="text-sm font-bold text-ap-text">{nextTurno.clienteNombre}</div>
          </div>
          <span className="font-mono text-lg font-bold text-[#2F6BFF]">{toAR(nextTurno.fechaHora)}</span>
        </div>
      )}

      {total > 0 && doneCount === total && (
        <div className="flex items-center gap-3 rounded-xl border border-[#1B3D28] bg-[rgba(34,211,102,.07)] px-4 py-3">
          <span className="text-lg">🎉</span>
          <span className="text-sm font-semibold text-[#34D399]">¡Todos los turnos de hoy completados!</span>
        </div>
      )}

      {/* Turno list */}
      {total === 0 ? (
        <div className="py-16 text-center text-sm text-ap-muted">No hay turnos para hoy</div>
      ) : (
        <div className="flex flex-col gap-4">
          <Section
            label="Mañana"
            icon={<Sun size={14} color="#6F6F73" />}
            items={morning}
          />
          <Section
            label="Tarde"
            icon={<Moon size={14} color="#6F6F73" />}
            items={afternoon}
          />
        </div>
      )}
    </div>
  );
}
