"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { StatChip } from "@/components/ui/StatChip";
import { SparklineChart } from "./SparklineChart";
import { BarChart } from "./BarChart";
import { ServiceBars } from "./ServiceBars";

interface Turno {
  fechaHora: string;
  precioFinal: number;
  servicioNombre: string;
}

interface GananciasScreenProps {
  turnos: Turno[];
}

const SVC_COLORS: Record<string, string> = {
  "Corte de pelo": "#22D366",
  "Corte + barba": "#2F6BFF",
  "Coloración": "#B79CFF",
  "Claritos": "#E8A33D",
  "Tratamiento capilar": "#F26157",
  "Peinado": "#6F6F73",
};

export function GananciasScreen({ turnos }: GananciasScreenProps) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("year");
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const money = (n: number) => "$" + n.toLocaleString("es-AR");

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
        return d.getMonth() === now.getMonth() && d.getFullYear() === selYear;
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

    const svcMap = new Map<string, number>();
    filtered.forEach((t) => {
      svcMap.set(t.servicioNombre, (svcMap.get(t.servicioNombre) ?? 0) + t.precioFinal);
    });
    const serviceData = Array.from(svcMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, total]) => ({
        name: name.length > 8 ? name.slice(0, 7) + "." : name,
        total,
        color: SVC_COLORS[name] ?? "#6F6F73",
      }));

    const sparklineData = barData.map((d) => d.value);

    // Trend: compare with previous year
    const prevYearTotal = turnos
      .filter((t) => new Date(t.fechaHora).getFullYear() === selYear - 1)
      .reduce((a, t) => a + t.precioFinal, 0);
    const trendPct = prevYearTotal > 0 ? Math.round(((total - prevYearTotal) / prevYearTotal) * 100) : null;

    return { total, count, ticket, barData, serviceData, sparklineData, trendPct };
  }, [turnos, period, selYear]);

  const periodLabels: Record<string, string> = {
    week: "TOTAL · ESTA SEMANA",
    month: "TOTAL · ESTE MES",
    year: "TOTAL COBRADO · " + selYear,
  };

  return (
    <div className="flex flex-1 flex-col pb-16">
      <div className="px-4 pt-2">
        {/* Title */}
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
        <div className="mb-3 flex gap-1.5">
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

        {/* Hero card */}
        <div className="mb-3 rounded-[18px] border border-[#253450] p-3.5" style={{ background: "linear-gradient(145deg, #182238, #0F1827)" }}>
          <div className="mb-0.5 flex items-center justify-between">
            <div className="text-[10px] font-bold tracking-wider text-[#5F7BAD]">{periodLabels[period]}</div>
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

      {/* Service chart */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="rounded-[13px] border border-ap-border-soft bg-ap-s1 p-2.5">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ap-muted">
            Ganancia por servicio
          </div>
          <ServiceBars data={stats.serviceData} />
        </div>
      </div>
    </div>
  );
}
