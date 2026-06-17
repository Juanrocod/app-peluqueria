export function StatChip({
  label,
  value,
  color = "var(--color-ap-text)",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-[11px] border border-ap-border-soft bg-ap-s1 px-2.5 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ap-muted">
        {label}
      </div>
      <div className="font-mono-num mt-1 text-[13px] font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
