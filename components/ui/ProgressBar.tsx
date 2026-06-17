export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1E2A1A]">
      <div
        className="h-full rounded-full transition-[width] duration-400 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: "linear-gradient(90deg, #22D366, #2F6BFF)",
        }}
      />
    </div>
  );
}
