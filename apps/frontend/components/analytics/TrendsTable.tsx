"use client";

import { ExternalLink } from "lucide-react";
import { TrendItem, TrendSource } from "@/types/trends";

interface TrendsTableProps {
  trends: TrendItem[];
}

const sourceColors: Record<TrendSource, string> = {
  youtube: "text-red-400 bg-red-400/10",
  tiktok: "text-indigo-400 bg-indigo-400/10",
  reddit: "text-orange-400 bg-orange-400/10",
  instagram: "text-pink-400 bg-pink-400/10",
};

function MomentumBar({ score }: { score: number }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  return (
    <div className="flex items-center gap-3 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-stibios-border rounded-full overflow-hidden">
        <div
          className="h-full bg-stibios-accent rounded-full transition-all"
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      <span className="text-stibios-text text-xs font-semibold w-6 text-right">
        {score}
      </span>
    </div>
  );
}

export function TrendsTable({ trends }: TrendsTableProps) {
  return (
    <div className="bg-stibios-surface border border-stibios-border rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-stibios-border">
        <h2 className="text-stibios-text font-semibold text-base">
          Top 5 Tendencias Actuales
        </h2>
        <p className="text-stibios-muted text-xs mt-1">
          Ordenadas por momentum score
        </p>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-stibios-border">
            <th className="text-left px-6 py-3 text-stibios-muted text-xs font-medium uppercase tracking-wider w-8">
              #
            </th>
            <th className="text-left px-6 py-3 text-stibios-muted text-xs font-medium uppercase tracking-wider">
              Tendencia
            </th>
            <th className="text-left px-6 py-3 text-stibios-muted text-xs font-medium uppercase tracking-wider">
              Fuente
            </th>
            <th className="text-left px-6 py-3 text-stibios-muted text-xs font-medium uppercase tracking-wider">
              Tipo
            </th>
            <th className="text-left px-6 py-3 text-stibios-muted text-xs font-medium uppercase tracking-wider min-w-[140px]">
              Momentum
            </th>
            <th className="text-right px-6 py-3 text-stibios-muted text-xs font-medium uppercase tracking-wider">
              Link
            </th>
          </tr>
        </thead>
        <tbody>
          {trends.map((trend, index) => (
            <tr
              key={trend.id}
              className="border-b border-stibios-border/50 hover:bg-stibios-bg/60 transition-colors duration-150 last:border-0"
            >
              <td className="px-6 py-4 text-stibios-muted text-sm font-mono">
                {String(index + 1).padStart(2, "0")}
              </td>
              <td className="px-6 py-4">
                <span className="text-stibios-text text-sm font-medium line-clamp-1">
                  {trend.title}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${sourceColors[trend.source]}`}
                >
                  {trend.source}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-stibios-muted text-xs capitalize">
                  {trend.type}
                </span>
              </td>
              <td className="px-6 py-4">
                <MomentumBar score={trend.momentumScore} />
              </td>
              <td className="px-6 py-4 text-right">
                <a
                  href={trend.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-stibios-accent hover:text-indigo-300 text-xs transition-colors"
                >
                  Ver
                  <ExternalLink size={12} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
