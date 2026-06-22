interface SparklineChartProps {
  data: number[];
  height?: number;
}

export function SparklineChart({ data, height = 48 }: SparklineChartProps) {
  const vw = 300;
  const filtered = data.filter((d) => d > 0);
  if (filtered.length < 2) return null;
  const max = Math.max(...filtered);
  const chartH = height - 4;
  const stepX = (vw - 10) / (filtered.length - 1);
  const pts = filtered.map((d, i) => ({
    x: 5 + i * stepX,
    y: chartH - Math.round((d / max) * (chartH - 4)),
  }));
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${pts[0].x} ${chartH + 2} L ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${pts[pts.length - 1].x} ${chartH + 2} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${vw} ${height}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id="spArea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22D366" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#22D366" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spArea)" />
      <polyline points={poly} fill="none" stroke="#22D366" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3.5 : 2} fill="#131313" stroke="#22D366" strokeWidth={2} />
      ))}
    </svg>
  );
}
