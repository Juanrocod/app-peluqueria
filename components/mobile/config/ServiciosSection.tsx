"use client";

import { useState } from "react";
import { ChevronLeft, Scissors, ChevronRight, Edit, Plus } from "lucide-react";

interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
  color: string;
}

const DEMO_SERVICES: Servicio[] = [
  { id: "1", nombre: "Corte de pelo",       duracion: 40, precio: 10000, color: "#22D366" },
  { id: "2", nombre: "Corte + barba",       duracion: 45, precio: 15000, color: "#2F6BFF" },
  { id: "3", nombre: "Coloración",          duracion: 90, precio: 8000,  color: "#B79CFF" },
  { id: "4", nombre: "Claritos",            duracion: 30, precio: 20000, color: "#E8A33D" },
  { id: "5", nombre: "Tratamiento capilar", duracion: 60, precio: 6000,  color: "#F26157" },
  { id: "6", nombre: "Peinado",             duracion: 10, precio: 5000,  color: "#6F6F73" },
];

interface ServiciosSectionProps {
  onBack: () => void;
  servicios?: Servicio[];
}

export function ServiciosSection({ onBack, servicios }: ServiciosSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = servicios ?? DEMO_SERVICES;
  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2.5 border-b border-[#1A1A1C] px-4 py-3">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-ap-border-soft bg-ap-s1">
          <ChevronLeft size={16} color="#ADADB0" />
        </button>
        <Scissors size={19} color="#B79CFF" />
        <span className="font-display text-xl font-semibold">Servicios</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-2.5 pb-4">
        {list.map((svc) => {
          const isEditing = editingId === svc.id;
          return (
            <div
              key={svc.id}
              className="mb-2 overflow-hidden rounded-[14px] border bg-ap-s1"
              style={{
                borderColor: isEditing ? `${svc.color}55` : "#2A2A2C",
                borderLeft: `3px solid ${svc.color}`,
              }}
            >
              <button
                onClick={() => setEditingId(isEditing ? null : svc.id)}
                className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-[#232325]"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold">{svc.nombre}</div>
                  <div className="mt-0.5 font-mono-num text-xs text-ap-sub">
                    {svc.duracion} min · {money(svc.precio)}
                  </div>
                </div>
                {isEditing ? <ChevronRight size={16} color="#6F6F73" /> : <Edit size={16} color="#6F6F73" />}
              </button>

              {isEditing && (
                <div className="flex flex-col gap-2 border-t border-[#1E1E20] bg-[#161618] px-3.5 py-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[["Nombre", svc.nombre, "span 3"], ["Precio", money(svc.precio), "span 1"], ["Min", String(svc.duracion), "span 1"]].map(([label, val, span], i) => (
                      <div key={i} className={`rounded-[10px] border border-ap-border-soft bg-ap-s1 px-2.5 py-2 ${span === "span 3" ? "col-span-3" : ""}`}>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-ap-muted">{label}</div>
                        <input
                          defaultValue={val}
                          className="mt-0.5 w-full bg-transparent text-sm font-bold text-ap-text outline-none"
                          style={{ fontFamily: i === 0 ? "inherit" : "var(--font-mono), monospace" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-[9px] border border-[rgba(242,97,87,.35)] px-3 py-2 text-xs font-semibold text-ap-danger">
                      Eliminar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded-[9px] bg-[#22D366] py-2 text-[13px] font-bold text-[#08130D]"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#38383B] py-3.5 text-[13px] font-semibold text-ap-sub">
          <Plus size={16} color="#6F6F73" />
          Agregar servicio
        </button>
      </div>
    </div>
  );
}
