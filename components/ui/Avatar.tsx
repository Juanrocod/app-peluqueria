"use client";

const COLORS = ["#2F6BFF", "#8B5CF6", "#E8A33D", "#22D366", "#F26157"];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = COLORS[name.length % COLORS.length];
  const radius = Math.round(size * 0.3);
  const fontSize = Math.round(size * 0.36);

  return (
    <div
      className="flex shrink-0 items-center justify-center font-bold"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontSize,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}
