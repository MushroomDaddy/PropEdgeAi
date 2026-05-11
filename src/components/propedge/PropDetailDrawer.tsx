import { cn } from "@/lib/utils";
import {
  X, ShoppingCart, Target,
  BarChart3, History, AlertTriangle,
} from "lucide-react";
import { EdgeBadge, ValueScoreBadge, DataSourceBadge, DirectionBadge } from "./Badges";

interface PropDetail {
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
  lastUpdated?: number;
  playerName?: string;
  // Line movement
  lineMovement?: { timestamp: number; line: number; snapshotType: string }[];
  // Hit rate history
  hitRate?: number;
  hitSampleSize?: number;
}

interface PropDetailDrawerProps {
  prop: PropDetail | null;
  onClose: () => void;
  onAddToPicks?: () => void;
}

export function PropDetailDrawer({ prop, onClose, onAddToPicks }: PropDetailDrawerProps) {
  if (!prop) return null;

  const projDiff = prop.projection - prop.line;
  const isOver = prop.overUnder === "over";

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-white/10 z-50 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-white/10 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-sm font-semibold">{prop.playerName || "Prop"} — {prop.statType}</h3>
            <div className="flex items-center gap-2 mt-1">
              <DirectionBadge direction={prop.overUnder} line={prop.line} />
              <span className="text-xs text-muted-foreground">{prop.platform}</span>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Score Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase mb-1">Value Score</div>
              <div className="flex justify-center">
                {prop.valueScore !== undefined ? <ValueScoreBadge score={prop.valueScore} size="md" /> : <span className="text-lg font-bold">—</span>}
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase mb-1">Edge</div>
              <div className="flex justify-center"><EdgeBadge edge={prop.edge} /></div>
            </div>
          </div>

          {/* Why it rates well */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
              <Target className="size-3.5" /> Why This Rates Well
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {prop.edge > 5 && <li>• Strong edge of {prop.edge.toFixed(1)}% above market value</li>}
              {prop.modelProb && prop.modelProb > 60 && <li>• Model probability of {prop.modelProb}% indicates high confidence</li>}
              {projDiff !== 0 && (
                <li>• Projection ({prop.projection}) is {Math.abs(projDiff).toFixed(1)} {isOver ? "above" : "below"} the line ({prop.line})</li>
              )}
              {prop.confidence && prop.confidence >= 65 && <li>• Confidence score of {prop.confidence}% from multiple data sources</li>}
              {prop.hitRate && prop.hitRate > 55 && <li>• Historical hit rate of {prop.hitRate}% on similar lines</li>}
            </ul>
          </div>

          {/* Risk Factors */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="size-3.5" /> Risk Factors
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {prop.bustRisk !== undefined && prop.bustRisk > 30 && <li>• Bust risk at {prop.bustRisk}%</li>}
              {prop.edge < 3 && <li>• Thin edge — small line movement could eliminate value</li>}
              {prop.confidence && prop.confidence < 55 && <li>• Lower confidence score — fewer data sources agree</li>}
              <li>• <DataSourceBadge source="demo" /> Mock data — verify with live sources before wagering</li>
            </ul>
          </div>

          {/* Key Stats Grid */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-cyan-400" /> Detailed Stats
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              <StatRow label="Line" value={prop.line.toString()} />
              <StatRow label="Projection" value={prop.projection.toString()} />
              <StatRow label="Proj Diff" value={`${projDiff > 0 ? "+" : ""}${projDiff.toFixed(1)}`} color={projDiff > 0 ? "text-emerald-400" : "text-red-400"} />
              <StatRow label="Edge" value={`${prop.edge > 0 ? "+" : ""}${prop.edge.toFixed(1)}%`} color={prop.edge > 0 ? "text-emerald-400" : "text-red-400"} />
              {prop.modelProb !== undefined && <StatRow label="Model Prob" value={`${prop.modelProb}%`} />}
              {prop.marketImpliedProb !== undefined && <StatRow label="Market Implied" value={`${prop.marketImpliedProb}%`} />}
              {prop.confidence !== undefined && <StatRow label="Confidence" value={`${prop.confidence}%`} />}
              {prop.bustRisk !== undefined && <StatRow label="Bust Risk" value={`${prop.bustRisk}%`} color={prop.bustRisk > 40 ? "text-red-400" : undefined} />}
            </div>
          </div>

          {/* Line Movement */}
          {prop.lineMovement && prop.lineMovement.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                <History className="size-3.5 text-purple-400" /> Line Movement
              </h4>
              <div className="space-y-2">
                {prop.lineMovement.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground capitalize">{m.snapshotType}</span>
                      <span className="text-muted-foreground">{new Date(m.timestamp).toLocaleDateString()}</span>
                    </div>
                    <span className="font-mono font-medium">{m.line.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Picks button */}
          {onAddToPicks && (
            <button
              onClick={onAddToPicks}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold py-3 hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="size-4" />
              Add to Pick Builder
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-medium", color || "text-foreground")}>{value}</span>
    </div>
  );
}
