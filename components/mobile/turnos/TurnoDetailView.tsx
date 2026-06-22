"use client";

import { useTransition } from "react";
import { ChevronLeft, Scissors, CalendarDays, MapPin, Phone, DollarSign, Tag, Clock, Check, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { actualizarEstadoTurno } from "@/actions/turnos";

interface TurnoDetail {
  id: string;
  fechaHora: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string | null;
  observaciones?: string | null;
  modalidad: string;
  direccion?: string | null;
  estado: string;
  servicio: { nombre: string; precio: number; duracion: number };
}

interface TurnoDetailViewProps {
  turno: TurnoDetail;
  onBack: () => void;
}

export function TurnoDetailView({ turno, onBack }: TurnoDetailViewProps) {
  const [isPending, startTransition] = useTransition();
  const fecha = new Date(turno.fechaHora);
  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  function handleAction(estado: "CONFIRMADO" | "CANCELADO" | "COMPLETADO") {
    startTransition(async () => {
      await actualizarEstadoTurno(turno.id, estado);
    });
  }


  return (
    <div className="flex flex-1 flex-col bg-ap-bg pb-16">
      {/* Back */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1"
          >
            <ChevronLeft size={17} color="#ADADB0" />
          </button>
          <span className="text-base font-bold">Detalle</span>
        </div>
        <StatusBadge estado={turno.estado} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-5">
        {/* Avatar + Name + Phone — centered */}
        <div className="mb-5 flex flex-col items-center">
          <Avatar name={turno.clienteNombre} size={56} />
          <div className="mt-3 text-center">
            <div className="font-display text-xl font-semibold leading-tight">
              {turno.clienteNombre}
            </div>
            <div className="mt-1 text-sm text-ap-sub">{turno.clienteTelefono}</div>
          </div>
        </div>

        {/* Info chips — 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[12px] border border-ap-border-soft bg-ap-s1 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Scissors size={15} color="#ADADB0" />
              <span className="text-[13px] font-semibold">{turno.servicio.nombre}</span>
            </div>
          </div>
          <div className="rounded-[12px] border border-ap-border-soft bg-ap-s1 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Clock size={15} color="#ADADB0" />
              <span className="text-[13px] font-semibold">{turno.servicio.duracion} min</span>
            </div>
          </div>
          <div className="rounded-[12px] border border-ap-border-soft bg-ap-s1 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} color="#ADADB0" />
              <span className="text-[13px] font-semibold capitalize">
                {format(fecha, "EEE d", { locale: es })} · {format(fecha, "HH:mm")}
              </span>
            </div>
          </div>
          <div className="rounded-[12px] border border-ap-border-soft bg-ap-s1 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <DollarSign size={15} color="#ADADB0" />
              <span className="font-mono-num text-[13px] font-semibold text-[#22D366]">{money(turno.servicio.precio)}</span>
            </div>
          </div>
          <div className="rounded-[12px] border border-ap-border-soft bg-ap-s1 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <MapPin size={15} color="#ADADB0" />
              <span className="text-[13px] font-semibold">{turno.modalidad === "DOMICILIO" ? "Domicilio" : "En local"}</span>
            </div>
          </div>
          <div className="rounded-[12px] border border-ap-border-soft bg-ap-s1 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Phone size={15} color="#ADADB0" />
              <span className="text-[13px] font-semibold">{turno.clienteTelefono}</span>
            </div>
          </div>
        </div>
        {turno.modalidad === "DOMICILIO" && turno.direccion && (
          <div className="mt-2 rounded-[12px] border border-ap-border-soft bg-ap-s1 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <MapPin size={15} color="#E8A33D" />
              <span className="text-[13px] font-semibold text-ap-warning">{turno.direccion}</span>
            </div>
          </div>
        )}

        {/* Observations — amber card */}
        {turno.observaciones && (
          <div className="mt-3 rounded-[12px] border border-[rgba(232,163,61,.2)] bg-[rgba(232,163,61,.08)] px-3.5 py-2.5">
            <div className="flex items-start gap-2">
              <Tag size={15} color="#E8A33D" className="mt-0.5 shrink-0" />
              <span className="text-[13px] leading-snug text-ap-warning">{turno.observaciones}</span>
            </div>
          </div>
        )}

        {/* Expired banner */}
        {(() => {
          const isExpired = fecha < new Date() && (turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO");
          if (!isExpired) return null;
          return (
            <div className="mt-4 rounded-[13px] border border-[rgba(232,163,61,.25)] bg-[rgba(232,163,61,.08)] p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle size={16} color="#E8A33D" />
                <span className="text-[13px] font-semibold text-ap-warning">
                  Este turno pasó y no fue confirmado
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction("COMPLETADO")}
                  disabled={isPending}
                  className="flex-1 rounded-[11px] bg-[#22D366] py-2.5 text-[13px] font-bold text-[#08130D] transition-[filter] hover:brightness-110 disabled:opacity-50"
                >
                  Realizado
                </button>
                <button
                  onClick={() => handleAction("CANCELADO")}
                  disabled={isPending}
                  className="flex-1 rounded-[11px] border border-ap-danger bg-transparent py-2.5 text-[13px] font-semibold text-ap-danger transition-[filter] hover:brightness-110 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          );
        })()}

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2.5">
          {turno.estado === "PENDIENTE" && fecha >= new Date() && (
            <button
              onClick={() => handleAction("CONFIRMADO")}
              disabled={isPending}
              className="w-full rounded-[13px] bg-[#22D366] py-3.5 text-[15px] font-bold text-[#08130D] transition-[filter] hover:brightness-110 disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                <Check size={17} />
                Confirmar turno
              </span>
            </button>
          )}
          {turno.estado === "CONFIRMADO" && fecha >= new Date() && (
            <button
              onClick={() => handleAction("COMPLETADO")}
              disabled={isPending}
              className="w-full rounded-[13px] bg-ap-primary py-3.5 text-[15px] font-bold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
            >
              Marcar como realizado
            </button>
          )}
          {(turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO") && fecha >= new Date() && (
            <button
              onClick={() => handleAction("CANCELADO")}
              disabled={isPending}
              className="w-full rounded-[13px] border border-ap-danger bg-transparent py-3.5 text-sm font-semibold text-ap-danger transition-[filter] hover:brightness-110 disabled:opacity-50"
            >
              Cancelar turno
            </button>
          )}
          {turno.estado === "COMPLETADO" && (
            <div className="rounded-[13px] border border-[rgba(47,107,255,.2)] bg-[rgba(47,107,255,.08)] p-3.5 text-center text-[13px] font-semibold text-ap-primary">
              Turno realizado - migrado a Ganancias
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
