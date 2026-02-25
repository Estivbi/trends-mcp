"use client";

import { Music, TrendingUp, Radio, Zap } from "lucide-react";
import { KpiCard } from "@/components/analytics/KpiCard";
import { MomentumChart } from "@/components/analytics/MomentumChart";
import { SourcesChart } from "@/components/analytics/SourcesChart";
import { TrendsTable } from "@/components/analytics/TrendsTable";
import {
  mockTrends,
  mockMomentum48h,
  mockSourceDistribution,
} from "@/lib/mockData";

const avgMomentum =
  mockTrends.length > 0
    ? Math.round(
        mockTrends.reduce((acc, t) => acc + t.momentumScore, 0) /
          mockTrends.length
      )
    : 0;

const audioCount = mockTrends.filter((t) => t.type === "audio").length;

const topSource =
  mockSourceDistribution.length > 0
    ? mockSourceDistribution.reduce((a, b) => (a.value > b.value ? a : b))
    : { name: "—", value: 0 };

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-stibios-bg text-stibios-text">
      {/* Header */}
      <header className="border-b border-stibios-border bg-stibios-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-stibios-accent/20 flex items-center justify-center">
              <Zap size={14} className="text-stibios-accent" />
            </div>
            <span className="text-stibios-text font-semibold text-sm">
              Trends MCP
            </span>
            <span className="text-stibios-border">|</span>
            <span className="text-stibios-muted text-sm">Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stibios-muted text-xs">Live</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-stibios-text tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-stibios-muted text-sm mt-1">
            Visión general del motor multi-fuente de tendencias
          </p>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Audios Detectados"
            value={audioCount}
            subtitle="Tendencias de tipo audio"
            icon={Music}
            trend={{ value: 12, label: "vs. ayer" }}
            accentColor="#6366f1"
          />
          <KpiCard
            title="Momentum Promedio"
            value={`${avgMomentum} pts`}
            subtitle="Score medio del top 5"
            icon={TrendingUp}
            trend={{ value: 8, label: "vs. ayer" }}
            accentColor="#10b981"
          />
          <KpiCard
            title="Mejor Red"
            value={topSource.name}
            subtitle={`${topSource.value}% de las tendencias`}
            icon={Radio}
            accentColor="#f97316"
          />
          <KpiCard
            title="Tendencias Activas"
            value={mockTrends.length}
            subtitle="En seguimiento ahora"
            icon={Zap}
            trend={{ value: 5, label: "vs. ayer" }}
            accentColor="#38bdf8"
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MomentumChart data={mockMomentum48h} />
          </div>
          <div>
            <SourcesChart data={mockSourceDistribution} />
          </div>
        </section>

        {/* Trends Table */}
        <section>
          <TrendsTable trends={mockTrends} />
        </section>
      </main>
    </div>
  );
}
