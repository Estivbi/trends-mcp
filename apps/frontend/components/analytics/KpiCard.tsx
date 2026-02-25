"use client";

import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accentColor?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "#6366f1",
}: KpiCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div className="bg-stibios-surface border border-stibios-border rounded-xl p-6 flex flex-col gap-4 hover:border-stibios-accent/40 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <p className="text-stibios-muted text-sm font-medium">{title}</p>
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
      </div>

      <div>
        <p className="text-stibios-text text-3xl font-bold tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-stibios-muted text-xs mt-1">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium">
          <span
            className={isPositive ? "text-emerald-400" : "text-rose-400"}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-stibios-muted">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
