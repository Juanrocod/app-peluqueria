"use client";

export function Toggle({
  checked,
  onChange,
  color = "#22D366",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-150"
      style={{ background: checked ? color : "#2A2A2C" }}
    >
      <span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] duration-150"
        style={{ left: checked ? 21 : 3 }}
      />
    </button>
  );
}
