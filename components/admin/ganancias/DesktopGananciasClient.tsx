"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Scissors, Package, Users, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TurnoDesktop {
  fechaHora: string;
  gananciaServicio: number;
  servicioNombre: string;
  productos: { nombre: string; ganancia: number }[];
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const PIE_COLORS = ["#2F6BFF", "#22D366", "#B79CFF", "#E8A33D", "#F26157", "#7CB9FF", "#6F6F73"];

export function DesktopGananciasClient({ turnos }: { turnos: TurnoDesktop[] }) {
  const [period, setPeriod] = useState<"month" | "year">("year");
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth());

  const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");

  const filtered = useMemo(() => {
    return turnos.filter((t) => {
      const d = new Date(t.fechaHora);
      if (period === "month") {
        return d.getFullYear() === selYear && d.getMonth() === selMonth;
      }
      return d.getFullYear() === selYear;
    });
  }, [turnos, period, selYear, selMonth]);

  const kpis = useMemo(() => {
    const totalServicios = filtered.reduce((s, t) => s + t.gananciaServicio, 0);
    const totalProductos = filtered.reduce(
      (s, t) => s + t.productos.reduce((ps, p) => ps + p.ganancia, 0),
      0
    );
    const total = totalServicios + totalProductos;
    const count = filtered.length;
    const ticket = count ? Math.round(total / count) : 0;

    // Trend vs previous period
    const prevPeriodTotal = (() => {
      if (period === "year") {
        return turnos
          .filter((t) => new Date(t.fechaHora).getFullYear() === selYear - 1)
          .reduce((s, t) => s + t.gananciaServicio + t.productos.reduce((ps, p) => ps + p.ganancia, 0), 0);
      }
      const prevM = selMonth === 0 ? 11 : selMonth - 1;
      const prevY = selMonth === 0 ? selYear - 1 : selYear;
      return turnos
        .filter((t) => {
          const d = new Date(t.fechaHora);
          return d.getFullYear() === prevY && d.getMonth() === prevM;
        })
        .reduce((s, t) => s + t.gananciaServicio + t.productos.reduce((ps, p) => ps + p.ganancia, 0), 0);
    })();
    const trendPct = prevPeriodTotal > 0 ? Math.round(((total - prevPeriodTotal) / prevPeriodTotal) * 100) : null;

    return { totalServicios, totalProductos, total, count, ticket, trendPct };
  }, [filtered, turnos, period, selYear, selMonth]);

  const barData = useMemo(() => {
    return MONTHS.map((label, i) => {
      const monthTurnos = turnos.filter((t) => {
        const d = new Date(t.fechaHora);
        return d.getFullYear() === selYear && d.getMonth() === i;
      });
      const servicios = monthTurnos.reduce((s, t) => s + t.gananciaServicio, 0);
      const productos = monthTurnos.reduce(
        (s, t) => s + t.productos.reduce((ps, p) => ps + p.ganancia, 0),
        0
      );
      return { label, servicios, productos };
    });
  }, [turnos, selYear]);

  const productsPieData = useMemo(() => {
    const map = new Map<string, { ganancia: number; unidades: number }>();
    filtered.forEach((t) => {
      t.productos.forEach((p) => {
        const prev = map.get(p.nombre) ?? { ganancia: 0, unidades: 0 };
        map.set(p.nombre, { ganancia: prev.ganancia + p.ganancia, unidades: prev.unidades + 1 });
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].ganancia - a[1].ganancia)
      .map(([name, d]) => ({ name, value: d.ganancia, unidades: d.unidades }));
  }, [filtered]);

  const servicesPieData = useMemo(() => {
    const map = new Map<string, { ganancia: number; unidades: number }>();
    filtered.forEach((t) => {
      const prev = map.get(t.servicioNombre) ?? { ganancia: 0, unidades: 0 };
      map.set(t.servicioNombre, {
        ganancia: prev.ganancia + t.gananciaServicio,
        unidades: prev.unidades + 1,
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].ganancia - a[1].ganancia)
      .map(([name, d]) => ({ name, value: d.ganancia, unidades: d.unidades }));
  }, [filtered]);

  const prevMonth = () => {
    if (selMonth === 0) { setSelMonth(11); setSelYear((y) => y - 1); }
    else setSelMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (selMonth === 11) { setSelMonth(0); setSelYear((y) => y + 1); }
    else setSelMonth((m) => m + 1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <span className="font-display text-3xl font-bold text-ap-text">Ganancias</span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {(["month", "year"] as const).map((p) => {
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
                  {p === "month" ? "Mes" : "Año"}
                </button>
              );
            })}
          </div>

          {period === "month" && (
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
                <ChevronLeft size={14} color="#ADADB0" />
              </button>
              <span className="w-10 text-center font-mono-num text-xs text-ap-muted">{MONTHS[selMonth]}</span>
              <button onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
                <ChevronRight size={14} color="#ADADB0" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button onClick={() => setSelYear((y) => y - 1)} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
              <ChevronLeft size={14} color="#ADADB0" />
            </button>
            <span className="w-10 text-center font-mono-num text-xs text-ap-muted">{selYear}</span>
            <button onClick={() => setSelYear((y) => y + 1)} className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-ap-border-soft bg-ap-s1">
              <ChevronRight size={14} color="#ADADB0" />
            </button>
          </div>
        </div>
      </div>

      {/* Total hero card */}
      <div
        className="mb-4 rounded-[16px] border border-[#253450] p-5"
        style={{ background: "linear-gradient(145deg, #182238, #0F1827)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#5F7BAD]">
              {period === "year" ? `TOTAL COBRADO · ${selYear}` : `TOTAL · ${MONTHS[selMonth]} ${selYear}`}
            </div>
            <div className="font-mono-num text-4xl font-extrabold text-white">
              {money(kpis.total)}
            </div>
          </div>
          {kpis.trendPct !== null && (
            <div
              className="flex items-center gap-1.5 rounded-[10px] border px-3 py-2"
              style={{
                borderColor: kpis.trendPct >= 0 ? "rgba(34,211,102,.3)" : "rgba(242,97,87,.3)",
                background: kpis.trendPct >= 0 ? "rgba(34,211,102,.08)" : "rgba(242,97,87,.08)",
              }}
            >
              {kpis.trendPct >= 0
                ? <TrendingUp size={14} color="#22D366" />
                : <TrendingDown size={14} color="#F26157" />}
              <span className={`font-mono-num text-sm font-bold ${kpis.trendPct >= 0 ? "text-[#22D366]" : "text-[#F26157]"}`}>
                {kpis.trendPct >= 0 ? "+" : ""}{kpis.trendPct}%{" "}
                vs {period === "year" ? selYear - 1 : MONTHS[selMonth === 0 ? 11 : selMonth - 1]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI chips */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <KpiChip label="Servicios" value={money(kpis.totalServicios)} color="#2F6BFF" icon={<Scissors size={14} />} />
        <KpiChip label="Productos" value={money(kpis.totalProductos)} color="#22D366" icon={<Package size={14} />} />
        <KpiChip label="Turnos" value={String(kpis.count)} color="#B79CFF" icon={<Users size={14} />} />
        <KpiChip label="Ticket prom." value={money(kpis.ticket)} color="#E8A33D" icon={<Receipt size={14} />} />
      </div>

      {/* Stacked bar chart */}
      <div className="mb-6 rounded-[16px] border border-ap-border-soft bg-ap-s1 p-4">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ap-muted">
          Evolución mensual · {selYear}
        </div>
        <div className="mb-3 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-ap-muted">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#2F6BFF]" />Servicios
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-ap-muted">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#22D366]" />Productos
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barSize={22} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: "#6F6F73", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="servicios" stackId="a" fill="#2F6BFF" radius={[0, 0, 3, 3]} />
            <Bar dataKey="productos" stackId="a" fill="#22D366" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-2 gap-4">
        <PieCard
          title="Productos más rentables"
          data={productsPieData}
          emptyText="Sin productos vendidos en este período"
        />
        <PieCard
          title="Servicios más rentables"
          data={servicesPieData}
          emptyText="Sin turnos completados en este período"
        />
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function KpiChip({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-ap-border-soft bg-ap-s1 p-3.5">
      <div className="mb-2 flex items-center gap-1.5" style={{ color }}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-mono-num text-xl font-extrabold text-ap-text">{value}</div>
    </div>
  );
}

function PieCard({
  title,
  data,
  emptyText,
}: {
  title: string;
  data: { name: string; value: number; unidades: number }[];
  emptyText: string;
}) {
  const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-[16px] border border-ap-border-soft bg-ap-s1 p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-ap-muted">{title}</div>
      {data.length === 0 ? (
        <p className="py-4 text-center text-sm text-ap-muted">{emptyText}</p>
      ) : (
        <div className="flex items-center gap-4">
          <PieChart width={140} height={140}>
            <Pie
              data={data}
              cx={65}
              cy={65}
              innerRadius={38}
              outerRadius={65}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {data.slice(0, 5).map((d, i) => (
              <div key={d.name} className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="flex-1 truncate text-[11px] text-ap-text">{d.name}</span>
                <div className="shrink-0 text-right">
                  <div className="font-mono-num text-[11px] font-bold text-ap-text">{money(d.value)}</div>
                  <div className="text-[9px] text-ap-muted">{d.unidades} ud.</div>
                </div>
              </div>
            ))}
            {total > 0 && (
              <div className="mt-1 flex justify-between border-t border-ap-border-soft pt-1.5">
                <span className="text-[10px] text-ap-muted">Total</span>
                <span className="font-mono-num text-[11px] font-bold text-ap-text">{money(total)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Recharts tooltips ────────────────────────────────

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const money = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div style={{ background: "#1A1A1A", border: "1px solid #303033", borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ color: "#ADADB0", fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill, fontSize: 11, marginBottom: 2 }}>
          {p.name === "servicios" ? "Servicios" : "Productos"}: {money(p.value)}
        </p>
      ))}
      <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, marginTop: 4, borderTop: "1px solid #303033", paddingTop: 4 }}>
        Total: {money(total)}
      </p>
    </div>
  );
}

function PieTooltip({
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
      <p style={{ color: "#6F6F73", fontSize: 10 }}>{payload[0].payload.unidades} unidades</p>
    </div>
  );
}
