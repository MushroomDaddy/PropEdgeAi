import { formatDirection, formatLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface HitRateEntry {
  statType: string;
  line: number;
  overUnder: string;
  hitRate: number;
  sampleSize: number;
}

export function HitRateHeatmap({ data }: { data: HitRateEntry[] }) {
  if (!data || data.length === 0) return null;

  const getColor = (rate: number): string => {
    if (rate >= 80)
      return "bg-emerald-500/40 text-emerald-300 border-emerald-500/30";
    if (rate >= 65)
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
    if (rate >= 50) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    if (rate >= 35) return "bg-red-500/15 text-red-400 border-red-500/20";
    return "bg-red-500/30 text-red-300 border-red-500/30";
  };

  return (
    <div className="rounded-xl border border-white/5 bg-card/50 p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="size-2 rounded-full bg-emerald-400" />
        Hit Rate by Prop Type
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {data.map((d, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg border p-3 text-center transition-colors",
              getColor(d.hitRate),
            )}
          >
            <div className="text-[10px] opacity-70 mb-1 truncate">
              {formatLabel(d.statType)} {formatDirection(d.overUnder)} {d.line}
            </div>
            <div className="text-lg font-bold font-mono">{d.hitRate}%</div>
            <div className="text-[10px] opacity-50">n={d.sampleSize}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="size-2 rounded bg-emerald-500/40" /> 65%+
        </span>
        <span className="flex items-center gap-1">
          <div className="size-2 rounded bg-amber-500/20" /> 50-64%
        </span>
        <span className="flex items-center gap-1">
          <div className="size-2 rounded bg-red-500/20" /> &lt;50%
        </span>
      </div>
    </div>
  );
}
