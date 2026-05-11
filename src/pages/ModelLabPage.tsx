import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AlertTriangle, TrendingUp, Target, BarChart3, Zap } from "lucide-react";

export function ModelLabPage() {
  const perf = useQuery(api.results.modelPerformance);

  if (!perf) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading model data...</div>;

  return (
    <div className="space-y-6">
      {/* DEMO banner */}
      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-sm text-yellow-400">
        <AlertTriangle className="size-4" />
        <span>DEMO DATA — Model performance shown uses mock predictions. Connect live data for real calibration metrics.</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00FF88] to-[#00D4FF] bg-clip-text text-transparent">
          Model Performance Lab
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="size-4" />
          {perf.gradedPredictions} graded predictions — {perf.overallHitRate}% overall hit rate
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Predictions" value={perf.totalPredictions} icon={<BarChart3 className="size-4 text-[#00D4FF]" />} />
        <MetricCard label="Graded" value={perf.gradedPredictions} icon={<Target className="size-4 text-[#00FF88]" />} />
        <MetricCard label="Overall Hit Rate" value={`${perf.overallHitRate}%`} icon={<TrendingUp className="size-4 text-[#00FF88]" />} />
        <MetricCard label="Overs vs Unders" value={`${perf.overVsUnder.over.hitRate}% / ${perf.overVsUnder.under.hitRate}%`} icon={<Zap className="size-4 text-purple-400" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Hit Rate by Confidence Bucket */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="size-4 text-[#00FF88]" /> Hit Rate by Confidence Bucket
          </h3>
          <div className="space-y-2">
            {perf.hitRateByConfidence.map((b: any) => (
              <div key={b.bucket} className="flex items-center gap-3">
                <span className="text-xs w-14 text-muted-foreground font-mono">{b.bucket}%</span>
                <div className="flex-1 h-6 rounded bg-white/5 relative overflow-hidden">
                  <div
                    className="h-full rounded bg-gradient-to-r from-[#00FF88]/40 to-[#00FF88]/80"
                    style={{ width: `${b.hitRate}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
                    {b.hitRate}% ({b.hits}/{b.total})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI by Edge Bucket */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-[#00D4FF]" /> ROI by Edge Bucket
          </h3>
          <div className="space-y-2">
            {perf.roiByEdge.map((b: any) => (
              <div key={b.bucket} className="flex items-center gap-3">
                <span className="text-xs w-14 text-muted-foreground font-mono">{b.bucket}%</span>
                <div className="flex-1 h-6 rounded bg-white/5 relative overflow-hidden">
                  <div
                    className={`h-full rounded ${b.roi >= 0 ? "bg-gradient-to-r from-[#00D4FF]/40 to-[#00D4FF]/80" : "bg-gradient-to-r from-red-500/40 to-red-500/80"}`}
                    style={{ width: `${Math.min(100, Math.abs(b.roi) + 50)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
                    {b.roi > 0 ? "+" : ""}{b.roi}% ROI ({b.hitRate}% hit, n={b.total})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI by Sport */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">ROI by Sport</h3>
          <div className="space-y-2">
            {perf.roiBySport.map((s: any) => (
              <div key={s.sport} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="font-medium">{s.sport}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{s.hitRate}% hit ({s.total})</span>
                  <span className={`font-mono font-medium ${s.roi >= 0 ? "text-[#00FF88]" : "text-red-400"}`}>
                    {s.roi > 0 ? "+" : ""}{s.roi}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI by Platform */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">ROI by Platform</h3>
          <div className="space-y-2">
            {perf.roiByPlatform.map((p: any) => (
              <div key={p.platform} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="font-medium">{p.platform}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{p.hitRate}% hit ({p.total})</span>
                  <span className={`font-mono font-medium ${p.roi >= 0 ? "text-[#00FF88]" : "text-red-400"}`}>
                    {p.roi > 0 ? "+" : ""}{p.roi}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI by Prop Type */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">ROI by Prop Type</h3>
          <div className="space-y-2">
            {perf.roiByPropType.map((t: any) => (
              <div key={t.propType} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="font-medium capitalize">{t.propType.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{t.hitRate}% hit ({t.total})</span>
                  <span className={`font-mono font-medium ${t.roi >= 0 ? "text-[#00FF88]" : "text-red-400"}`}>
                    {t.roi > 0 ? "+" : ""}{t.roi}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Over vs Under */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Over vs Under Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-[#00FF88]/5 border border-[#00FF88]/20">
              <div className="text-xs text-muted-foreground mb-1">OVERS</div>
              <div className="text-2xl font-bold text-[#00FF88]">{perf.overVsUnder.over.hitRate}%</div>
              <div className="text-xs text-muted-foreground">{perf.overVsUnder.over.hits}/{perf.overVsUnder.over.total}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="text-xs text-muted-foreground mb-1">UNDERS</div>
              <div className="text-2xl font-bold text-red-400">{perf.overVsUnder.under.hitRate}%</div>
              <div className="text-xs text-muted-foreground">{perf.overVsUnder.under.hits}/{perf.overVsUnder.under.total}</div>
            </div>
          </div>
        </div>

        {/* Calibration Chart */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Calibration (Predicted vs Actual)</h3>
          <div className="space-y-2">
            {perf.calibration.map((c: any) => (
              <div key={c.predictedProb} className="flex items-center gap-3">
                <span className="text-xs w-20 text-muted-foreground">Pred: {c.predictedProb}%</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-4 rounded bg-white/5 relative overflow-hidden">
                    <div className="absolute h-full bg-purple-500/30 rounded" style={{ width: `${c.predictedProb}%` }} />
                    <div className="absolute h-full bg-[#00FF88]/60 rounded" style={{ width: `${c.actualHitRate}%` }} />
                  </div>
                  <span className="text-xs font-mono w-20">
                    Act: {c.actualHitRate}% <span className="text-muted-foreground">(n={c.sampleSize})</span>
                  </span>
                </div>
              </div>
            ))}
            <div className="flex gap-4 text-xs mt-2">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500/30" /> Predicted</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#00FF88]/60" /> Actual</span>
            </div>
          </div>
        </div>

        {/* Best Performing Players */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 text-[#00FF88]">🏆 Best Performing Players</h3>
          <div className="space-y-1.5">
            {perf.bestPlayers.map((p: any, i: number) => (
              <div key={p.name} className="flex items-center justify-between py-1 text-sm">
                <span>{i + 1}. {p.name}</span>
                <span className="font-mono text-[#00FF88]">{p.hitRate}% ({p.total})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Performing Players */}
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3 text-red-400">⚠️ Worst Performing Players</h3>
          <div className="space-y-1.5">
            {perf.worstPlayers.map((p: any, i: number) => (
              <div key={p.name} className="flex items-center justify-between py-1 text-sm">
                <span>{i + 1}. {p.name}</span>
                <span className="font-mono text-red-400">{p.hitRate}% ({p.total})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">{icon}{label}</div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
