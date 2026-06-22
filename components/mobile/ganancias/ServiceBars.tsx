interface ServiceData {
  name: string;
  total: number;
  color: string;
}

interface ServiceBarsProps {
  data: ServiceData[];
  height?: number;
}

export function ServiceBars({ data, height = 96 }: ServiceBarsProps) {
  const vw = 300;
  const max = Math.max(...data.map((d) => d.total)) || 1;
  const chartH = height - 22;
  const slot = data.length > 0 ? Math.floor(vw / data.length) : vw;
  const barW = slot - 6;
  const moneyK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${vw} ${height}`} preserveAspectRatio="xMidYMid meet" className="block overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max(3, Math.round((d.total / max) * chartH));
        const x = i * slot + 3;
        const y = chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={d.color} opacity={0.88} />
            <text x={x + barW / 2} y={chartH + 11} textAnchor="middle" fill={d.color} opacity={0.8} fontSize={7.5} fontFamily="JetBrains Mono, monospace">
              {d.name}
            </text>
            <text x={x + barW / 2} y={chartH + 21} textAnchor="middle" fill="#4A4A50" fontSize={7} fontFamily="JetBrains Mono, monospace">
              {moneyK(d.total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
