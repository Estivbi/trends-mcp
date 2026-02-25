"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MomentumChartProps {
  data: { time: string; score: number }[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-stibios-surface border border-stibios-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-stibios-muted text-xs mb-1">{label}</p>
        <p className="text-stibios-accent font-bold text-sm">
          {payload[0].value}
          <span className="text-stibios-muted font-normal"> pts</span>
        </p>
      </div>
    );
  }
  return null;
}

export function MomentumChart({ data }: MomentumChartProps) {
  return (
    <div className="bg-stibios-surface border border-stibios-border rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-stibios-text font-semibold text-base">
          Momentum en 48h
        </h2>
        <p className="text-stibios-muted text-xs mt-1">
          Evolución del score de tendencias en las últimas 48 horas
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#1e1e2e" }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#6366f1", stroke: "#0a0a0f", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
