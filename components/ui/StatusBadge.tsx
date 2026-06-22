const STATUS_MAP: Record<string, { color: string; bg: string; label: string }> = {
  PENDIENTE:  { color: "#E8A33D", bg: "rgba(232,163,61,.12)",  label: "Pendiente" },
  CONFIRMADO: { color: "#2F6BFF", bg: "rgba(47,107,255,.12)",  label: "Confirmado" },
  CANCELADO:  { color: "#F26157", bg: "rgba(242,97,87,.12)",   label: "Cancelado" },
  COMPLETADO: { color: "#22D366", bg: "rgba(34,211,102,.12)",  label: "Completado" },
};

export function StatusBadge({ estado }: { estado: string }) {
  const s = STATUS_MAP[estado] ?? STATUS_MAP.PENDIENTE;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="h-[7px] w-[7px] rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}
