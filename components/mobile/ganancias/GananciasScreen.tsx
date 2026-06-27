"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { StatChip } from "@/components/ui/StatChip";
import { SparklineChart } from "./SparklineChart";
import { BarChart } from "./BarChart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface Turno {
  fechaHora: string;
  precioFinal: number;
  servicioNombre: string;
  productos: { nombre: string; ganancia: number }[];
}

const PIE_COLORS = ["#2F6BFF", "#22D366", "#B79CFF", "#E8A33D", "#F26157", "#7CB9FF", "#6F6F73"];
const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function GananciasScreen({ turnos }: { turnos: Turno[] }) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("year");
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const money = (n: number) => "$" + n.toLocaleString("es-AR");

  const prevMonth = () => {
    if (selMonth === 0) { setSelMonth(11); setSelYear((y) => y - 1); }
    else setSelMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (selMonth === 11) { setSelMonth(0); setSelYear((y) => y + 1); }
    else setSelMonth((m) => m + 1);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const filtered = turnos.filter((t) => {
      const d = new Date(t.fechaHora);
      if (period === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      if (period === "month") {
        return d.getMonth() === selMonth && d.getFullYear() === selYear;
      }
      return d.getFullYear() === selYear;
    });

    const total = filtered.reduce((a, t) => a + t.precioFinal, 0);
    const count = filtered.length;
    const ticket = count ? Math.round(total / count) : 0;

    const monthlyMap = new Map<number, number>();
    turnos.forEach((t) => {
      const d = new Date(t.fechaHora);
      if (d.getFullYear() === selYear) {
        const m = d.getMonth();
        monthlyMap.set(m, (monthlyMap.get(m) ?? 0) + t.precioFinal);
      }
    });
    const monthLabels = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const barData = monthLabels.map((label, i) => ({
      label,
      value: monthlyMap.get(i) ?? 0,
      isCurrent: selYear === now.getFullYear() && i === now.getMonth(),
    }));

    // Services pie
    const svcMap = new Map<string, { ganancia: number; unidades: number }>();
    filtered.forEach((t) => {
      const prev = svcMap.get(t.servicioNombre) ?? { ganancia: 0, unidades: 0 };
      svcMap.set(t.servicioNombre, { ganancia: prev.ganancia + t.precioFinal, unidades: prev.unidades + 1 });
    });
    const servicesPieData = Array.from(svcMap.entries())
      .sort((a, b) => b[1].ganancia - a[1].ganancia)
      .map(([name, d]) => ({ name, value: d.ganancia, unidades: d.unidades }));

    // Products pie
    const prodMap = new Map<string, { ganancia: number; unidades: number }>();
    filtered.forEach((t) => {
      t.productos.forEach((p) => {
        const prev = prodMap.get(p.nombre) ?? { ganancia: 0, unidades: 0 };
        prodMap.set(p.nombre, { ganancia: prev.ganancia + p.ganancia, unidades: prev.unidades + 1 });
      });
    });
    const productsPieData = Array.from(prodMap.entries())
      .sort((a, b) => b[1].ganancia - a[1].ganancia)
      .map(([name, d]) => ({ name, value: d.ganancia, unidades: d.unidades }));

    const sparklineData = barData.map((d) => d.value);

    const prevYearTotal = turnos
      .filter((t) => new Date(t.fechaHora).getFullYear() === selYear - 1)
      .reduce((a, t) => a + t.precioFinal, 0);
    const trendPct = prevYearTotal > 0 ? Math.round(((total - prevYearTotal) / prevYearTotal) * 100) : null;

    return { total, count, ticket, barData, servicesPieData, productsPieData, sparklineData, trendPct };
  }, [turnos, period, selYear, selMonth]);

  const periodLabel = period === "week"
    ? "TOTAL · ESTA SEMANA"
    : period === "month"
    ? `TOTAL · ${MONTHS_FULL[selMonth].toUpperCase()} ${selYear}`
    : `TOTAL COBRADO · ${selYear}`;

  return (
    <div className="flex flex-1 flex-col pb-16">
      <div className="px-4 pt-2">
        {/* Title + year nav */}
        <div className="mb-2.5 flex items-center justify-between">
          <div className="font-display text-[28px] font-bold">Ganancias</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setSelYear(selYear - 1)} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
              <ChevronLeft size={14} color="#ADADB0" />
            </button>
            <span className="font-mono-num text-xs text-ap-muted w-10 text-center">{selYear}</span>
            <button onClick={() => setSelYear(selYear + 1)} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
              <ChevronRight size={14} color="#ADADB0" />
            </button>
          </div>
        </div>

        {/* Period chips */}
        <div className="mb-2 flex gap-1.5">
          {(["week", "month", "year"] as const).map((p) => {
            const on = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors"
                style={{
                  background: on ? "rgba(34,211,102,.1)" : "#1C1C1E",
                  color: on ? "#22D366" : "#6F6F73",
                  border: on ? "1px solid rgba(34,211,102,.3)" : "1px solid transparent",
                }}
              >
                {p === "week" ? "Semana" : p === "month" ? "Mes" : "Año"}
              </button>
            );
          })}
        </div>

        {/* Month selector — only when period === "month" */}
        {period === "month" && (
          <div className="mb-2.5 flex items-center gap-1">
            <button onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
              <ChevronLeft size={14} color="#ADADB0" />
            </button>
            <span className="font-mono-num text-xs text-ap-muted w-24 text-center">{MONTHS_FULL[selMonth]}</span>
            <button onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
              <ChevronRight size={14} color="#ADADB0" />
            </button>
          </div>
        )}

        {/* Hero card */}
        <div className="mb-3 rounded-[18px] border border-[#253450] p-3.5" style={{ background: "linear-gradient(145deg, #182238, #0F1827)" }}>
          <div className="mb-0.5 flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-wider text-[#5F7BAD]">{periodLabel}</div>
            {stats.trendPct !== null && (
              <div className="flex items-center gap-1">
                {stats.trendPct >= 0
                  ? <TrendingUp size={12} color="#22D366" />
                  : <TrendingDown size={12} color="#F26157" />}
                <span className={`font-mono-num text-[11px] font-bold ${stats.trendPct >= 0 ? "text-[#22D366]" : "text-[#F26157]"}`}>
                  {stats.trendPct >= 0 ? "+" : ""}{stats.trendPct}% vs {selYear - 1}
                </span>
              </div>
            )}
          </div>
          <div className="mb-2.5 font-mono-num text-[26px] font-extrabold leading-none text-white">
            {money(stats.total)}
          </div>
          <SparklineChart data={stats.sparklineData} />
        </div>

        {/* Stat chips */}
        <div className="mb-3 grid grid-cols-2 gap-1.5">
          <StatChip label="Cortes" value={`${stats.count} cortes`} />
          <StatChip label="Ticket prom." value={money(stats.ticket)} color="#2F6BFF" />
        </div>

        {/* Bar chart */}
        <div className="mb-3 rounded-[13px] border border-ap-border-soft bg-ap-s1 p-2.5">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ap-muted">
            Evolución mensual · {selYear}
          </div>
          <BarChart data={stats.barData} />
        </div>
      </div>

      {/* Pie charts — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
        <MobilePieCard
          title="Servicios más rentables"
          data={stats.servicesPieData}
          emptyText="Sin turnos en el período"
        />
        <MobilePieCard
          title="Productos más rentables"
          data={stats.productsPieData}
          emptyText="Sin productos vendidos en el período"
        />
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function MobilePieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { unidades: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");
  return (
    <div style={{ background: "#1A1A1A", border: "1px solid #303033", borderRadius: 8, padding: "6px 10px" }}>
      <p style={{ color: "#ADADB0", fontSize: 11, marginBottom: 2 }}>{payload[0].name}</p>
      <p style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{money(payload[0].value)}</p>
      <p style={{ color: "#6F6F73", fontSize: 10 }}>{payload[0].payload.unidades} ud.</p>
    </div>
  );
}

function MobilePieCard({
  title,
  data,
  emptyText,
}: {
  title: string;
  data: { name: string; value: number; unidades: number }[];
  emptyText: string;
}) {
  const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");

  return (
    <div className="rounded-[13px] border border-ap-border-soft bg-ap-s1 p-2.5">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ap-muted">{title}</div>
      {data.length === 0 ? (
        <p className="py-3 text-center text-sm text-ap-muted">{emptyText}</p>
      ) : (
        <div className="flex items-center gap-3">
          <PieChart width={110} height={110}>
            <Pie
              data={data}
              cx={50}
              cy={50}
              innerRadius={28}
              outerRadius={50}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<MobilePieTooltip />} />
          </PieChart>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {data.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex min-w-0 items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="flex-1 truncate text-[10px] text-ap-text">{d.name}</span>
                <div className="shrink-0 text-right">
                  <div className="font-mono-num text-[10px] font-bold text-ap-text">{money(d.value)}</div>
                  <div className="text-[8px] text-ap-muted">{d.unidades} ud.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
