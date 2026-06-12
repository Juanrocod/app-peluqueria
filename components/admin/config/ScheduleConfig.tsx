"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import LayerBaseHours from "./LayerBaseHours";
import LayerRecurring from "./LayerRecurring";
import LayerExceptions from "./LayerExceptions";

type HorarioRow = {
  id: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  tipoFranja: "POSITIVA" | "NEGATIVA";
  motivo?: string | null;
};

type BloqueoRow = {
  id: string;
  fecha: string;
  todoElDia: boolean;
  horaInicio: string;
  horaFin: string;
  motivo?: string | null;
};

type LayerKey = "base" | "recurrentes" | "excepciones";

const LAYERS: {
  key: LayerKey;
  title: string;
  subtitle: string;
  dotColor: string;
}[] = [
  {
    key: "base",
    title: "Horario Base",
    subtitle: "Capa 1 · Franjas de atención por día",
    dotColor: "bg-emerald-500",
  },
  {
    key: "recurrentes",
    title: "Bloques Recurrentes",
    subtitle: "Capa 2 · Descansos, almuerzos y pausas",
    dotColor: "bg-red-500",
  },
  {
    key: "excepciones",
    title: "Fechas Bloqueadas",
    subtitle: "Capa 3 · Feriados y días especiales",
    dotColor: "bg-amber-500",
  },
];

export default function ScheduleConfig({
  horarios,
  bloqueos,
  onPreview,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
  onPreview: () => void;
}) {
  const [open, setOpen] = useState<LayerKey | "">("base");

  function toggle(key: LayerKey) {
    setOpen((prev) => (prev === key ? "" : key));
  }

  return (
    <div className="flex flex-col gap-3">
      {LAYERS.map(({ key, title, subtitle, dotColor }) => (
        <div
          key={key}
          className="overflow-hidden rounded-xl border border-ap-border bg-ap-s1"
        >
          {/* Header del accordion */}
          <button
            onClick={() => toggle(key)}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-ap-s2"
            aria-expanded={open === key}
          >
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
              <div>
                <p className="text-sm font-semibold text-ap-text">{title}</p>
                <p className="text-xs text-ap-muted">{subtitle}</p>
              </div>
            </div>
            {open === key ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-ap-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-ap-muted" />
            )}
          </button>

          {/* Cuerpo colapsable */}
          {open === key && (
            <div className="border-t border-ap-border px-4 pb-4 pt-3">
              {key === "base" && <LayerBaseHours horarios={horarios} />}
              {key === "recurrentes" && <LayerRecurring horarios={horarios} />}
              {key === "excepciones" && <LayerExceptions bloqueos={bloqueos} />}
            </div>
          )}
        </div>
      ))}

      {/* Botón de previsualización */}
      <button
        onClick={onPreview}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-ap-border bg-ap-s1 py-3 text-sm font-medium text-ap-accent transition hover:bg-ap-s2 hover:border-ap-primary"
      >
        <span>👁</span>
        Ver cómo me ven los clientes
      </button>
    </div>
  );
}
