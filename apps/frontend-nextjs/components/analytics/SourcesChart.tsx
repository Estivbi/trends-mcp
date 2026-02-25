"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SourceItem {
  name: string;
  value: number;
  color: string;
}

interface SourcesChartProps {
  data: SourceItem[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: SourceItem }[];
}) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-stibios-surface border border-stibios-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-stibios-text text-sm font-semibold">{item.name}</p>
        <p className="text-stibios-muted text-xs">{item.value}%</p>
      </div>
    );
  }
  return null;
}

export function SourcesChart({ data }: SourcesChartProps) {
  return (
    <div className="bg-stibios-surface border border-stibios-border rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-stibios-text font-semibold text-base">
          Fuentes de Tendencias
        </h2>
        <p className="text-stibios-muted text-xs mt-1">
          Distribución por plataforma
        </p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <ul className="mt-4 space-y-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-stibios-muted text-xs">{item.name}</span>
            </div>
            <span className="text-stibios-text text-xs font-semibold">
              {item.value}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
