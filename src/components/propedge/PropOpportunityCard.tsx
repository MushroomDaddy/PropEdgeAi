import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ChevronRight, Star } from "lucide-react";
import { EdgeBadge, ValueScoreBadge, ConfidenceBadge, RiskLabel, DataSourceBadge } from "./Badges";

interface PropOpportunityCardProps {
  statType: string;
  line: number;
  projection: number;
  edge: number;
  overUnder: string;
  platform: string;
  confidence?: number;
  modelProb?: number;
  marketImpliedProb?: number;
  bustRisk?: number;
  valueScore?: number;
  dataSource?: string;
  isTop?: boolean;
  onClick?: () => void;
}

export function PropOpportunityCard({
  statType, line, projection, edge, overUnder, platform,
  confidence, modelProb, marketImpliedProb, bustRisk, valueScore,
  dataSource = "demo", isTop, onClick,
}: PropOpportunityCardProps) {
  const isOver = overUnder === "over";
  const projDiff = projection - line;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border p-4 transition-all cursor-pointer",
        "hover:border-white/20 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5",
        isTop
          ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
          : "border-white/5 bg-card/50 hover:bg-card/80",
      )}
    >
      {/* Top pick star */}
      {isTop && (
        <div className="absolute -top-1.5 -right-1.5">
          <Star className="size-5 text-amber-400 fill-amber-400" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold">{statType}</span>
            {valueScore !== undefined && <ValueScoreBadge score={valueScore} size="xs" />}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{platform}</span>
        </div>
        <EdgeBadge edge={edge} />
      </div>

      {/* Direction + Line */}
      <div className="flex items-center gap-3 mb-3">
        <span className={cn(
          "inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg",
          isOver ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
        )}>
          {isOver ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {overUnder.toUpperCase()} {line}
        </span>
        <div className="text-xs text-muted-foreground">
          Proj: <span className="font-mono font-medium text-foreground">{projection}</span>
          <span className={cn("ml-1 font-mono", projDiff > 0 ? "text-emerald-400" : "text-red-400")}>
            ({projDiff > 0 ? "+" : ""}{projDiff.toFixed(1)})
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {modelProb !== undefined && (
          <div className="rounded-lg bg-white/5 px-2 py-1.5">
            <div className="text-[10px] text-muted-foreground/60 mb-0.5">Model</div>
            <div className="text-xs font-mono font-semibold">{modelProb}%</div>
          </div>
        )}
        {marketImpliedProb !== undefined && (
          <div className="rounded-lg bg-white/5 px-2 py-1.5">
            <div className="text-[10px] text-muted-foreground/60 mb-0.5">Market</div>
            <div className="text-xs font-mono">{marketImpliedProb}%</div>
          </div>
        )}
        {confidence !== undefined && (
          <div className="rounded-lg bg-white/5 px-2 py-1.5">
            <div className="text-[10px] text-muted-foreground/60 mb-0.5">Conf</div>
            <ConfidenceBadge confidence={confidence} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <RiskLabel bustRisk={bustRisk} />
          <DataSourceBadge source={dataSource} />
        </div>
        <ChevronRight className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
      </div>
    </div>
  );
}
