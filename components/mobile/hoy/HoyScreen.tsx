"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatChip } from "@/components/ui/StatChip";
import { ProximoBanner } from "./ProximoBanner";
import { TurnoCard } from "./TurnoCard";

interface Turno {
  id: string;
  fechaHora: string;
  clienteNombre: string;
  clienteTelefono: string;
  observaciones: string | null;
  modalidad: string;
  direccion: string | null;
  estado: string;
  servicio: {
    nombre: string;
    duracion: number;
    precio: number;
  };
}

interface HoyScreenProps {
  turnos: Turno[];
  slotsTotal: number;
}

export function HoyScreen({ turnos, slotsTotal }: HoyScreenProps) {
  const total = turnos.length;
  const doneCount = turnos.filter((t) => t.estado === "COMPLETADO").length;
  const free = Math.max(0, slotsTotal - total);
  const occ = slotsTotal > 0 ? Math.round((total / slotsTotal) * 100) : 0;
  const gTotal = turnos.reduce((a, t) => a + Number(t.servicio.precio), 0);
  const gDone = turnos
    .filter((t) => t.estado === "COMPLETADO")
    .reduce((a, t) => a + Number(t.servicio.precio), 0);
  const money = (n: number) => "$" + n.toLocaleString("es-AR");
  const today = new Date();

  const pending = turnos.filter((t) => t.estado !== "COMPLETADO");
  const nextTurno = pending[0];

  return (
    <div className="flex flex-1 flex-col pb-16">
      {/* Header */}
      <div className="px-4 pt-2">
        <div className="mb-0.5 flex items-end justify-between">
          <div>
            <div className="font-display text-2xl font-semibold">Hoy</div>
            <div className="mt-0.5 font-mono-num text-xs text-ap-muted">
              {format(today, "EEEE d 'de' MMMM", { locale: es })}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono-num text-[22px] font-bold leading-none">
              <span className="text-[#22D366]">{doneCount}</span>
              <span className="text-base text-ap-muted"> / {total}</span>
            </div>
            <div className="text-[11px] text-ap-muted">realizados</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2.5 mb-3">
          <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-ap-muted">
            <span>Ocupación del día</span>
            <span style={{ color: occ > 70 ? "#34D399" : "#E8A33D" }}>{occ}%</span>
          </div>
          <ProgressBar percent={occ} />
        </div>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-3 gap-1.5">
          <StatChip label="Libres" value={free} color="#6F6F73" />
          <StatChip label="Ganancia est." value={money(gTotal)} color="#22D366" />
          <StatChip label="Realizado" value={money(gDone)} color="#2F6BFF" />
        </div>

        {/* Próximo turno */}
        {nextTurno ? (
          <ProximoBanner
            nombre={nextTurno.clienteNombre}
            hora={format(new Date(nextTurno.fechaHora), "HH:mm")}
          />
        ) : total > 0 ? (
          <div className="flex items-center gap-2.5 rounded-[13px] border border-[#1B3D28] bg-[rgba(34,211,102,.07)] px-3.5 py-2.5">
            <span className="text-lg">🎉</span>
            <span className="text-[13px] font-semibold text-[#34D399]">
              ¡Todos los turnos de hoy completados!
            </span>
          </div>
        ) : null}
      </div>

      {/* Turno list */}
      <div className="mt-3 flex-1 overflow-y-auto px-4">
        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ap-muted">
          Turnos del día
        </div>
        {turnos.map((t) => (
          <TurnoCard
            key={t.id}
            id={t.id}
            nombre={t.clienteNombre}
            servicio={t.servicio.nombre}
            duracion={t.servicio.duracion}
            precio={Number(t.servicio.precio)}
            hora={format(new Date(t.fechaHora), "HH:mm")}
            estado={t.estado}
            modalidad={t.modalidad}
            direccion={t.direccion}
            telefono={t.clienteTelefono}
            observaciones={t.observaciones}
          />
        ))}
        {turnos.length === 0 && (
          <div className="py-10 text-center text-sm text-ap-muted">
            No hay turnos para hoy
          </div>
        )}
      </div>
    </div>
  );
}
