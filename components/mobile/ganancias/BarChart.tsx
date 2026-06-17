interface BarChartProps {
  data: { label: string; value: number; isCurrent?: boolean }[];
  width?: number;
  height?: number;
}

export function BarChart({ data, width = 266, height = 82 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const chartH = height - 14;
  const slot = Math.floor(width / data.length);
  const barW = Math.max(6, slot - 4);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block overflow-visible">
      <defs>
        <linearGradient id="mBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22D366" />
          <stop offset="100%" stopColor="#2F6BFF" stopOpacity={0.6} />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const isFuture = d.value === 0;
        const barH = isFuture ? 2 : Math.max(3, Math.round((d.value / max) * chartH));
        const x = i * slot + 2;
        const y = isFuture ? chartH - 2 : chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={isFuture ? 2 : barH} rx={3} fill={isFuture ? "#222" : d.isCurrent ? "url(#mBarGrad)" : "#243652"} />
            <text x={x + barW / 2} y={height - 1} textAnchor="middle" fill={d.isCurrent ? "#7CB9FF" : "#404048"} fontSize={7} fontFamily="JetBrains Mono, monospace">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
