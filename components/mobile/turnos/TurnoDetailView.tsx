"use client";

import { useTransition } from "react";
import { ChevronLeft, Scissors, CalendarDays, MapPin, Phone, DollarSign, Tag } from "lucide-react";
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

  const infoRow = (Icon: typeof Scissors, label: string, value: string, sub?: string | null) => (
    <div className="flex gap-3 border-b border-[#1E1E20] py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-ap-border-soft bg-ap-s1">
        <Icon size={17} color="#ADADB0" />
      </span>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-ap-muted">{label}</div>
        <div className="mt-0.5 text-sm font-semibold">{value}</div>
        {sub && <div className="mt-0.5 text-xs text-ap-sub">{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col bg-ap-bg pb-16">
      {/* Back */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <button
          onClick={onBack}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1"
        >
          <ChevronLeft size={17} color="#ADADB0" />
        </button>
        <span className="text-base font-bold">Detalle del turno</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-5">
        {/* Avatar + Name + Badge */}
        <div className="mb-4 flex items-center gap-2.5">
          <Avatar name={turno.clienteNombre} size={46} />
          <div className="flex-1">
            <div className="font-display text-xl font-semibold leading-tight">
              {turno.clienteNombre}
            </div>
            <div className="mt-1.5">
              <StatusBadge estado={turno.estado} />
            </div>
          </div>
        </div>

        {/* Info rows */}
        {infoRow(Scissors, "SERVICIO", turno.servicio.nombre, `${turno.servicio.duracion} min`)}
        {infoRow(CalendarDays, "FECHA Y HORA", format(fecha, "EEEE d 'de' MMMM", { locale: es }), format(fecha, "HH:mm") + " hs")}
        {infoRow(MapPin, "MODALIDAD", turno.modalidad === "DOMICILIO" ? "A domicilio" : "En el local", turno.modalidad === "DOMICILIO" ? turno.direccion : null)}
        {infoRow(Phone, "CONTACTO", turno.clienteTelefono)}
        {infoRow(DollarSign, "PRECIO", money(turno.servicio.precio))}
        {turno.observaciones && infoRow(Tag, "OBSERVACIONES", turno.observaciones)}

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2.5">
          {turno.estado === "PENDIENTE" && (
            <button
              onClick={() => handleAction("CONFIRMADO")}
              disabled={isPending}
              className="w-full rounded-[13px] bg-[#22D366] py-3.5 text-[15px] font-bold text-[#08130D] transition-[filter] hover:brightness-110 disabled:opacity-50"
            >
              Confirmar turno
            </button>
          )}
          {turno.estado === "CONFIRMADO" && (
            <button
              onClick={() => handleAction("COMPLETADO")}
              disabled={isPending}
              className="w-full rounded-[13px] bg-ap-primary py-3.5 text-[15px] font-bold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
            >
              Marcar como realizado
            </button>
          )}
          {(turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO") && (
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
