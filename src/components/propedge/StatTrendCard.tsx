import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatTrendCardProps {
  label: string;
  l5: number | undefined;
  l10: number | undefined;
  season: number | undefined;
  format?: (v: number) => string;
}

export function StatTrendCard({ label, l5, l10, season, format = (v) => v.toString() }: StatTrendCardProps) {
  if (l5 === undefined && l10 === undefined && season === undefined) return null;

  // Trend = L5 vs season
  const trend = l5 !== undefined && season !== undefined ? l5 - season : 0;
  const TrendIcon = trend > 0.5 ? TrendingUp : trend < -0.5 ? TrendingDown : Minus;
  const trendColor = trend > 0.5 ? "text-emerald-400" : trend < -0.5 ? "text-red-400" : "text-zinc-400";

  return (
    <div className="rounded-xl border border-white/5 bg-card/50 p-4 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <TrendIcon className={cn("size-3.5", trendColor)} />
      </div>

      {/* Sparkline-like visual */}
      <div className="flex items-end gap-1 h-8 mb-3">
        {[season, l10, l5].map((val, i) => {
          if (val === undefined) return <div key={i} className="flex-1 rounded-sm bg-white/5 h-2" />;
          const maxVal = Math.max(l5 || 0, l10 || 0, season || 0, 1);
          const height = Math.max(8, (val / maxVal) * 100);
          const colors = ["bg-zinc-600", "bg-cyan-500/60", "bg-emerald-500/80"];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={cn("w-full rounded-sm transition-all", colors[i])} style={{ height: `${height}%` }} />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-1 text-center">
        <div>
          <div className="text-[10px] text-muted-foreground/50 mb-0.5">SZN</div>
          <div className="text-xs font-mono text-muted-foreground">{season !== undefined ? format(season) : "—"}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground/50 mb-0.5">L10</div>
          <div className="text-xs font-mono">{l10 !== undefined ? format(l10) : "—"}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground/50 mb-0.5">L5</div>
          <div className="text-sm font-mono font-bold text-white">{l5 !== undefined ? format(l5) : "—"}</div>
        </div>
      </div>
    </div>
  );
}
