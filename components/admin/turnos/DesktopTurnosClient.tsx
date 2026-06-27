"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Phone, MapPin, Clock, DollarSign, CalendarDays, MessageSquare } from "lucide-react";
import { actualizarEstadoTurno } from "@/actions/turnos";

type SerializedTurno = {
  id: string;
  fechaHora: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail: string | null;
  observaciones: string | null;
  modalidad: string;
  direccion: string | null;
  estado: string;
  servicio: { nombre: string; precio: number; duracion: number };
  servicios: { nombre: string; duracion: number; precio: number }[];
  isNew: boolean;
};

const STATUS_COLOR: Record<string, string> = {
  PENDIENTE:  "#E8A33D",
  CONFIRMADO: "#2F6BFF",
  CANCELADO:  "#F26157",
  COMPLETADO: "#22D366",
};

const STATUS_BG: Record<string, string> = {
  PENDIENTE:  "rgba(232,163,61,.15)",
  CONFIRMADO: "rgba(47,107,255,.15)",
  CANCELADO:  "rgba(242,97,87,.15)",
  COMPLETADO: "rgba(34,211,102,.15)",
};

function money(n: number) {
  return "$" + n.toLocaleString("es-AR");
}

function toARDate(iso: string) {
  const d = new Date(iso);
  return {
    hora: d.toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }),
    fecha: d.toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "numeric", month: "short",
    }),
    fechaLong: d.toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "numeric", month: "long", year: "numeric",
    }),
    isPast: d < new Date(),
  };
}

function getSvcInfo(t: SerializedTurno) {
  if (t.servicios.length > 0) {
    return {
      nombre: t.servicios.map((s) => s.nombre).join(", "),
      precio: t.servicios.reduce((a, s) => a + s.precio, 0),
      duracion: t.servicios.reduce((a, s) => a + s.duracion, 0),
    };
  }
  return { nombre: t.servicio.nombre, precio: t.servicio.precio, duracion: t.servicio.duracion };
}

function getActions(estado: string): { label: string; estado: string; color: string }[] {
  switch (estado) {
    case "PENDIENTE":
      return [
        { label: "Confirmar", estado: "CONFIRMADO", color: "#2F6BFF" },
        { label: "Cancelar",  estado: "CANCELADO",  color: "#F26157" },
      ];
    case "CONFIRMADO":
      return [
        { label: "Completar", estado: "COMPLETADO", color: "#22D366" },
        { label: "Cancelar",  estado: "CANCELADO",  color: "#F26157" },
      ];
    case "COMPLETADO":
      return [{ label: "Revertir a Pendiente", estado: "PENDIENTE", color: "#E8A33D" }];
    case "CANCELADO":
      return [{ label: "Revertir a Pendiente", estado: "PENDIENTE", color: "#E8A33D" }];
    default:
      return [];
  }
}

const FILTER_OPTIONS: Record<"proximos" | "historial", { value: string; label: string }[]> = {
  proximos: [
    { value: "todos",      label: "Todos"      },
    { value: "PENDIENTE",  label: "Pendientes" },
    { value: "CONFIRMADO", label: "Confirmados" },
  ],
  historial: [
    { value: "todos",      label: "Todos"      },
    { value: "COMPLETADO", label: "Completados" },
    { value: "CANCELADO",  label: "Cancelados"  },
  ],
};

export function DesktopTurnosClient({ turnos }: { turnos: SerializedTurno[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"proximos" | "historial">("proximos");
  const [filter, setFilter] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isDone = (t: SerializedTurno) =>
    t.estado === "COMPLETADO" || t.estado === "CANCELADO";

  const filtered = turnos.filter((t) => {
    if (tab === "proximos" && isDone(t)) return false;
    if (tab === "historial" && !isDone(t)) return false;
    if (filter !== "todos" && t.estado !== filter) return false;
    return true;
  });

  const selected = selectedId ? turnos.find((t) => t.id === selectedId) ?? null : null;

  function handleAction(id: string, estado: string) {
    startTransition(async () => {
      await actualizarEstadoTurno(
        id,
        estado as "PENDIENTE" | "CONFIRMADO" | "COMPLETADO" | "CANCELADO"
      );
      router.refresh();
    });
  }

  function switchTab(t: "proximos" | "historial") {
    setTab(t);
    setFilter("todos");
    setSelectedId(null);
  }

  return (
    <div className="flex h-full min-h-[600px]">
      {/* ── Left: List ─────────────────────────────────────────── */}
      <div
        className="flex flex-col min-w-0 transition-all duration-200"
        style={{ width: selected ? "55%" : "100%" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-2xl font-bold text-ap-text">Turnos</h2>
            <p className="text-xs text-ap-muted">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/admin/turnos/nuevo"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: "#2F6BFF" }}
          >
            + Nuevo turno
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex rounded-[11px] border border-ap-border-soft bg-ap-s1 p-[3px]">
          {(["proximos", "historial"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="flex-1 rounded-[9px] py-2 text-[13px] font-semibold transition-colors"
              style={{
                background: tab === t ? "#2F6BFF" : "transparent",
                color: tab === t ? "#fff" : "#ADADB0",
              }}
            >
              {t === "proximos" ? "Próximos" : "Historial"}
            </button>
          ))}
        </div>

        {/* Filter chips */}
        <div className="mb-3 flex gap-2">
          {FILTER_OPTIONS[tab].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors"
              style={{
                background: filter === value ? "#2F6BFF" : "rgba(255,255,255,.06)",
                color: filter === value ? "#fff" : "#ADADB0",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-ap-muted">
              No hay turnos con este filtro.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((t) => {
                const { hora, fecha, isPast } = toARDate(t.fechaHora);
                const svc = getSvcInfo(t);
                const sc = STATUS_COLOR[t.estado] ?? "#6F6F73";
                const isSelected = t.id === selectedId;
                const isExpiredActive =
                  isPast && (t.estado === "PENDIENTE" || t.estado === "CONFIRMADO");

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(isSelected ? null : t.id)}
                    className="flex items-center gap-3 rounded-[14px] bg-ap-s1 px-4 py-3 text-left transition-colors hover:bg-ap-s2"
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: isSelected ? sc : "transparent",
                      borderLeftColor: isExpiredActive ? "#6F6F73" : sc,
                      borderLeftWidth: "3.5px",
                      opacity: isExpiredActive ? 0.65 : 1,
                    }}
                  >
                    {/* New dot */}
                    <div className="relative shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-ap-s2 text-sm font-bold text-ap-text">
                      {t.clienteNombre[0].toUpperCase()}
                      {t.isNew && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-ap-s1 bg-[#22D366]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[14px] font-bold ${isExpiredActive ? "line-through text-ap-muted" : "text-ap-text"}`}
                        >
                          {t.clienteNombre}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: STATUS_BG[t.estado], color: sc }}
                        >
                          {t.estado}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-ap-sub">{svc.nombre}</div>
                    </div>

                    {/* Time + price */}
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm font-bold text-ap-text">{hora}</div>
                      <div className="text-xs text-ap-muted">{fecha}</div>
                      <div className="font-mono text-xs font-semibold text-[#22D366]">
                        {money(svc.precio)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Detail panel ─────────────────────────────────── */}
      {selected && (() => {
        const svc = getSvcInfo(selected);
        const { hora, fechaLong } = toARDate(selected.fechaHora);
        const sc = STATUS_COLOR[selected.estado] ?? "#6F6F73";
        const actions = getActions(selected.estado);

        return (
          <div className="ml-4 flex w-[45%] shrink-0 flex-col rounded-2xl border border-ap-border bg-ap-s1">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-ap-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ap-s2 text-base font-bold text-ap-text">
                  {selected.clienteNombre[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-ap-text">{selected.clienteNombre}</div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: STATUS_BG[selected.estado], color: sc }}
                  >
                    {selected.estado}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-ap-muted transition-colors hover:text-ap-text"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { Icon: Phone,        value: selected.clienteTelefono,                                                                          key: "phone"    },
                  { Icon: Clock,        value: `${svc.duracion} min`,                                                                             key: "clock"    },
                  { Icon: CalendarDays, value: `${fechaLong} ${hora}`,                                                                            key: "date"     },
                  { Icon: DollarSign,   value: money(svc.precio),                                                                                  key: "price"    },
                ] as const).map(({ Icon, value, key }) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 rounded-xl border border-ap-border bg-ap-s2 px-3 py-2.5"
                  >
                    <Icon size={16} className="mt-0.5 shrink-0 text-ap-muted" />
                    <span className="text-[13px] text-ap-sub">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-ap-border bg-ap-s2 px-3 py-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-ap-muted">Servicio</div>
                <div className="mt-1 text-sm font-medium text-ap-text">{svc.nombre}</div>
              </div>

              {selected.modalidad === "DOMICILIO" && selected.direccion && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#6E5224] bg-[rgba(232,163,61,.1)] px-3 py-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#E8A33D]" />
                  <span className="text-[13px] text-[#E8A33D]">{selected.direccion}</span>
                </div>
              )}

              {selected.observaciones && (
                <div className="mt-3 rounded-xl border border-[#6E5224] bg-[rgba(232,163,61,.08)] px-3 py-2.5">
                  <div className="mb-1 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-[#E8A33D]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#E8A33D]">
                      Observaciones
                    </span>
                  </div>
                  <div className="text-sm text-ap-sub">{selected.observaciones}</div>
                </div>
              )}

              {selected.clienteEmail && (
                <div className="mt-3 rounded-xl border border-ap-border bg-ap-s2 px-3 py-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-ap-muted">Email</div>
                  <div className="mt-1 text-sm text-ap-sub">{selected.clienteEmail}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="border-t border-ap-border px-5 py-4">
                <div className="flex flex-col gap-2">
                  {actions.map(({ label, estado, color }) => (
                    <button
                      key={estado}
                      disabled={isPending}
                      onClick={() => handleAction(selected.id, estado)}
                      className="rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                      style={{ background: color }}
                    >
                      {isPending ? "Guardando..." : label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
