"use client";

import { useState } from "react";
import ScheduleConfig from "./ScheduleConfig";
import ClientPreviewModal from "./ClientPreviewModal";

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

export default function ConfigPageClient({
  horarios,
  bloqueos,
}: {
  horarios: HorarioRow[];
  bloqueos: BloqueoRow[];
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <ScheduleConfig
        horarios={horarios}
        bloqueos={bloqueos}
        onPreview={() => setShowPreview(true)}
      />
      {showPreview && (
        <ClientPreviewModal
          horarios={horarios.map((h) => ({
            diaSemana: h.diaSemana,
            horaApertura: h.horaApertura,
            horaCierre: h.horaCierre,
            tipoFranja: h.tipoFranja,
          }))}
          bloqueos={bloqueos.map((b) => ({
            fecha: b.fecha,
            todoElDia: b.todoElDia,
            horaInicio: b.horaInicio,
            horaFin: b.horaFin,
          }))}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
