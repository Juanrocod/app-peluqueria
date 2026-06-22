"use client";

const PROXIMOS_FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "PENDIENTE", label: "Pendiente" },
  { key: "CONFIRMADO", label: "Confirmado" },
] as const;

const HISTORIAL_FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "COMPLETADO", label: "Completado" },
  { key: "CANCELADO", label: "Cancelado" },
] as const;

const FILTER_COLORS: Record<string, string> = {
  PENDIENTE: "#E8A33D",
  CONFIRMADO: "#2F6BFF",
  CANCELADO: "#F26157",
  COMPLETADO: "#22D366",
};

export function FilterChips({
  active,
  onChange,
  mode = "proximos",
}: {
  active: string;
  onChange: (f: string) => void;
  mode?: "proximos" | "historial";
}) {
  const filters = mode === "historial" ? HISTORIAL_FILTERS : PROXIMOS_FILTERS;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-3">
      {filters.map((f) => {
        const on = active === f.key;
        const color = FILTER_COLORS[f.key] ?? "";
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background: on ? (color ? `${color}22` : "rgba(244,244,242,.12)") : "#1C1C1E",
              color: on ? (color || "#F4F4F2") : "#ADADB0",
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
