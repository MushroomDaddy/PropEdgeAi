import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


import {
  FlaskConical, TrendingUp, TrendingDown, Target, Zap,
  BarChart3, CheckCircle2, XCircle, Bot, Sparkles,
} from "lucide-react";
import { DemoBanner, EmptyState, SkeletonCard } from "@/components/propedge";
import { cn } from "@/lib/utils";

export function ModelLabPage() {
  const perf = useQuery(api.results.modelPerformance);
  const learningInsights = useQuery(api.modelLearning.learningInsights);
  
  const loading = perf === undefined;

  if (loading) {
    return (
      <div className="space-y-5">
        <DemoBanner />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Model Performance Lab</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!perf || perf.gradedPredictions === 0) {
    return (
      <div className="space-y-5">
        <DemoBanner />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Model Performance Lab</h1>
        <EmptyState icon={FlaskConical} title="No predictions graded" description="Model predictions will appear here once results are available" />
      </div>
    );
  }

  // Model Strengths / Weaknesses
  const allSports = perf.roiBySport || [];
  void perf.roiByPropType;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (perf.overallHitRate > 55) strengths.push(`Overall hit rate of ${perf.overallHitRate}% is above baseline`);
  else weaknesses.push(`Overall hit rate of ${perf.overallHitRate}% — room for improvement`);

  const bestSport = allSports.sort((a: any, b: any) => b.hitRate - a.hitRate)[0];
  const worstSport = [...allSports].sort((a: any, b: any) => a.hitRate - b.hitRate)[0];
  if (bestSport) strengths.push(`Strongest in ${bestSport.sport} (${bestSport.hitRate}% hit rate)`);
  if (worstSport && worstSport.sport !== bestSport?.sport) weaknesses.push(`Weakest in ${worstSport.sport} (${worstSport.hitRate}%)`);

  const highConf = perf.hitRateByConfidence?.find((b: any) => b.bucket === "80-90" || b.bucket === "90+");
  if (highConf && highConf.hitRate > 65) strengths.push(`High confidence picks hit at ${highConf.hitRate}%`);

  if (perf.overVsUnder) {
    const ov = perf.overVsUnder.over;
    const un = perf.overVsUnder.under;
    if (ov.hitRate > un.hitRate + 5) strengths.push(`Overs (${ov.hitRate}%) outperform unders (${un.hitRate}%)`);
    else if (un.hitRate > ov.hitRate + 5) strengths.push(`Unders (${un.hitRate}%) outperform overs (${ov.hitRate}%)`);
    else weaknesses.push(`No significant over/under edge — ${ov.hitRate}% vs ${un.hitRate}%`);
  }

  if (perf.bestPlayers?.[0]) strengths.push(`Best performer: ${perf.bestPlayers[0].name} (${perf.bestPlayers[0].hitRate}%)`);
  if (perf.worstPlayers?.[0]) weaknesses.push(`Worst performer: ${perf.worstPlayers[0].name} (${perf.worstPlayers[0].hitRate}%)`);

  return (
    <div className="space-y-5">
      <DemoBanner message="DEMO DATA — Model performance metrics use mock predictions. Connect live APIs for real accuracy tracking." />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Model Performance Lab
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FlaskConical className="size-4" />
          <span>{perf.gradedPredictions} graded / {perf.totalPredictions} total</span>
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HeroStat
          label="Overall Hit Rate"
          value={`${perf.overallHitRate}%`}
          icon={<Target className="size-4 text-emerald-400" />}
          bg="from-emerald-500/5"
          color={perf.overallHitRate > 55 ? "text-emerald-400" : "text-amber-400"}
        />
        <HeroStat
          label="Over Hit Rate"
          value={`${perf.overVsUnder?.over?.hitRate || 0}%`}
          icon={<TrendingUp className="size-4 text-cyan-400" />}
          bg="from-cyan-500/5"
          color="text-cyan-400"
          sub={`${perf.overVsUnder?.over?.total || 0} picks`}
        />
        <HeroStat
          label="Under Hit Rate"
          value={`${perf.overVsUnder?.under?.hitRate || 0}%`}
          icon={<TrendingDown className="size-4 text-red-400" />}
          bg="from-red-500/5"
          color="text-red-400"
          sub={`${perf.overVsUnder?.under?.total || 0} picks`}
        />
        <HeroStat
          label="Total Predictions"
          value={`${perf.totalPredictions}`}
          icon={<BarChart3 className="size-4 text-purple-400" />}
          bg="from-purple-500/5"
          color="text-white"
          sub={`${perf.gradedPredictions} graded`}
        />
      </div>

      {/* Calibration Chart */}
      <div className="rounded-xl border border-white/5 bg-card/50 p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400" />
          Calibration Chart
          <span className="text-[10px] text-muted-foreground font-normal ml-2">Predicted probability vs actual hit rate</span>
        </h3>
        <CalibrationChart data={perf.calibration || []} />
      </div>

      {/* Edge Bucket Cards + Confidence Bucket Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Confidence Buckets */}
        <div className="rounded-xl border border-white/5 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-400" />
            Hit Rate by Confidence
          </h3>
          <div className="space-y-2">
            {(perf.hitRateByConfidence || []).map((b: any) => (
              <BucketBar key={b.bucket} label={b.bucket + "%"} value={b.hitRate} total={b.total} color="cyan" />
            ))}
          </div>
        </div>

        {/* Edge Buckets */}
        <div className="rounded-xl border border-white/5 bg-card/50 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="size-2 rounded-full bg-purple-400" />
            ROI by Edge Bucket
          </h3>
          <div className="space-y-2">
            {(perf.roiByEdge || []).map((b: any) => (
              <BucketBar key={b.bucket} label={b.bucket + "%" } value={b.hitRate} total={b.total} roi={b.roi} color="purple" />
            ))}
          </div>
        </div>
      </div>

      {/* Sport / Platform / Prop Type Comparison */}
      <div className="grid md:grid-cols-3 gap-4">
        <ComparisonCard title="By Sport" icon={<Zap className="size-3.5 text-emerald-400" />} data={perf.roiBySport || []} labelKey="sport" />
        <ComparisonCard title="By Platform" icon={<BarChart3 className="size-3.5 text-cyan-400" />} data={perf.roiByPlatform || []} labelKey="platform" />
        <ComparisonCard title="By Prop Type" icon={<Target className="size-3.5 text-purple-400" />} data={perf.roiByPropType || []} labelKey="propType" />
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent p-5">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 className="size-4" /> Model Strengths
          </h3>
          <ul className="space-y-1.5">
            {strengths.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">+</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent p-5">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <XCircle className="size-4" /> Areas to Improve
          </h3>
          <ul className="space-y-1.5">
            {weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">–</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Model Summary */}
      <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="size-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-purple-400">What the Model is Learning</h3>
          <Sparkles className="size-3 text-purple-400/50" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The PropEdge model has processed <span className="text-foreground font-medium">{perf.totalPredictions}</span> predictions
          with an overall hit rate of <span className="text-foreground font-medium">{perf.overallHitRate}%</span>.
          {bestSport && <> It performs strongest in <span className="text-foreground font-medium">{bestSport.sport}</span> ({bestSport.hitRate}% hit rate).</>}
          {perf.overVsUnder && perf.overVsUnder.over.hitRate !== perf.overVsUnder.under.hitRate && (
            <> The model shows a {perf.overVsUnder.over.hitRate > perf.overVsUnder.under.hitRate ? "slight over bias" : "slight under bias"} — this is being calibrated.</>
          )}
          {perf.bestPlayers?.[0] && (
            <> Top-performing target: <span className="text-foreground font-medium">{perf.bestPlayers[0].name}</span> ({perf.bestPlayers[0].hitRate}% hit rate on {perf.bestPlayers[0].total} picks).</>
          )}
          {" "}More data will continue to improve edge detection and confidence calibration. DEMO DATA only.
        </p>
      </div>

      {/* Best / Worst Players */}
      <div className="grid md:grid-cols-2 gap-4">
        <PlayerPerfList title="Best Performers" players={perf.bestPlayers || []} positive />
        <PlayerPerfList title="Needs Improvement" players={perf.worstPlayers || []} positive={false} />
      </div>

      {/* Model Learning Insights (R10) */}
      {learningInsights && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="size-5 text-amber-400" />
            Model Learning Insights
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strongest areas */}
            <div className="rounded-xl border border-emerald-400/10 bg-card/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="size-4" /> Strongest Areas
              </h3>
              {learningInsights.strengths?.bestSport && (
                <div className="text-xs flex justify-between">
                  <span>Best Sport</span>
                  <span className="font-mono text-emerald-400">{learningInsights.strengths.bestSport.key} ({learningInsights.strengths.bestSport.hitRate}%)</span>
                </div>
              )}
              {learningInsights.strengths?.bestStatType && (
                <div className="text-xs flex justify-between">
                  <span>Best Stat Type</span>
                  <span className="font-mono text-emerald-400">{learningInsights.strengths.bestStatType.key} ({learningInsights.strengths.bestStatType.hitRate}%)</span>
                </div>
              )}
              {learningInsights.strengths?.bestPlatform && (
                <div className="text-xs flex justify-between">
                  <span>Best Platform</span>
                  <span className="font-mono text-emerald-400">{learningInsights.strengths.bestPlatform.key} ({learningInsights.strengths.bestPlatform.hitRate}%)</span>
                </div>
              )}
              {learningInsights.strengths?.bestConfBucket && (() => {
                const b = learningInsights.strengths.bestConfBucket as any;
                return (
                  <div className="text-xs flex justify-between">
                    <span>Best Confidence Bucket</span>
                    <span className="font-mono text-emerald-400">{b.bucketLabel || b.key} ({b.actualHitRate || b.hitRate}%)</span>
                  </div>
                );
              })()}
            </div>

            {/* Weakest areas */}
            <div className="rounded-xl border border-red-400/10 bg-card/50 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-red-400 flex items-center gap-1">
                <XCircle className="size-4" /> Weakest Areas
              </h3>
              {learningInsights.weaknesses?.worstSport && (
                <div className="text-xs flex justify-between">
                  <span>Worst Sport</span>
                  <span className="font-mono text-red-400">{learningInsights.weaknesses.worstSport.key} ({learningInsights.weaknesses.worstSport.hitRate}%)</span>
                </div>
              )}
              {learningInsights.weaknesses?.worstStatType && (
                <div className="text-xs flex justify-between">
                  <span>Worst Stat Type</span>
                  <span className="font-mono text-red-400">{learningInsights.weaknesses.worstStatType.key} ({learningInsights.weaknesses.worstStatType.hitRate}%)</span>
                </div>
              )}
              {learningInsights.weaknesses?.worstPlayers?.map((p: any) => (
                <div key={p.key} className="text-xs flex justify-between">
                  <span>{p.key}</span>
                  <span className="font-mono text-red-400">{p.hitRate}% ({p.total})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Over vs Under performance */}
          {learningInsights.overVsUnder && (
            <div className="rounded-xl border border-white/5 bg-card/50 p-4">
              <h3 className="text-sm font-semibold mb-3">Over vs Under Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-emerald-400/5 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {learningInsights.overVsUnder.over?.hitRate ?? "—"}%
                  </div>
                  <div className="text-xs text-muted-foreground">Overs ({learningInsights.overVsUnder.over?.total ?? 0})</div>
                </div>
                <div className="text-center p-3 bg-red-400/5 rounded-lg">
                  <div className="text-2xl font-bold text-red-400 font-mono">
                    {learningInsights.overVsUnder.under?.hitRate ?? "—"}%
                  </div>
                  <div className="text-xs text-muted-foreground">Unders ({learningInsights.overVsUnder.under?.total ?? 0})</div>
                </div>
              </div>
            </div>
          )}

          {/* Calibration */}
          {learningInsights.calibrationBuckets?.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-card/50 p-4">
              <h3 className="text-sm font-semibold mb-3">Calibration Check</h3>
              <div className="space-y-1.5">
                {learningInsights.calibrationBuckets.map((b: any) => (
                  <div key={b.bucketLabel} className="flex items-center gap-3 text-xs">
                    <span className="w-16 text-muted-foreground font-mono">{b.bucketLabel}%</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00D4FF] rounded-full"
                        style={{ width: `${Math.min(100, b.actualHitRate)}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono">{b.actualHitRate}%</span>
                    <span className={cn("w-12 text-right font-mono text-[10px]",
                      b.calibrationError <= 5 ? "text-emerald-400" : b.calibrationError <= 10 ? "text-yellow-400" : "text-red-400"
                    )}>
                      ±{b.calibrationError.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════ Hero Stat ═══════ */
function HeroStat({ label, value, icon, bg, color, sub }: {
  label: string; value: string; icon: React.ReactNode; bg: string; color: string; sub?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/5 bg-gradient-to-br to-transparent p-4", bg)}>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">
        {icon} {label}
      </div>
      <p className={cn("text-2xl font-bold font-mono", color)}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground/50 mt-1">{sub}</p>}
    </div>
  );
}

/* ═══════ Calibration Chart ═══════ */
function CalibrationChart({ data }: { data: { predictedProb: number; actualHitRate: number; sampleSize: number }[] }) {
  if (!data.length) return <EmptyState icon={BarChart3} title="No calibration data" />;

  const width = 400;
  const height = 250;
  const padding = { left: 45, right: 20, top: 10, bottom: 35 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const scaleX = (v: number) => padding.left + (v / 100) * plotW;
  const scaleY = (v: number) => padding.top + plotH - (v / 100) * plotH;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg mx-auto" style={{ minWidth: 300 }}>
        {/* Grid */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={`y-${v}`}>
            <line x1={padding.left} y1={scaleY(v)} x2={width - padding.right} y2={scaleY(v)} stroke="rgba(255,255,255,0.05)" />
            <text x={padding.left - 8} y={scaleY(v) + 4} textAnchor="end" className="text-[9px] fill-[rgba(255,255,255,0.3)]">{v}%</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={`x-${v}`}>
            <line x1={scaleX(v)} y1={padding.top} x2={scaleX(v)} y2={height - padding.bottom} stroke="rgba(255,255,255,0.05)" />
            <text x={scaleX(v)} y={height - padding.bottom + 15} textAnchor="middle" className="text-[9px] fill-[rgba(255,255,255,0.3)]">{v}%</text>
          </g>
        ))}

        {/* Perfect calibration line */}
        <line x1={scaleX(0)} y1={scaleY(0)} x2={scaleX(100)} y2={scaleY(100)} stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />
        <text x={scaleX(85)} y={scaleY(88)} className="text-[8px] fill-[rgba(255,255,255,0.2)]">Perfect</text>

        {/* Data line */}
        <polyline
          fill="none"
          stroke="#00FF88"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data.map((d) => `${scaleX(d.predictedProb)},${scaleY(d.actualHitRate)}`).join(" ")}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={scaleX(d.predictedProb)} cy={scaleY(d.actualHitRate)} r="5" fill="#00FF88" fillOpacity="0.3" stroke="#00FF88" strokeWidth="1.5" />
            <title>{`Predicted: ${d.predictedProb}% | Actual: ${d.actualHitRate}% | n=${d.sampleSize}`}</title>
          </g>
        ))}

        {/* Axis Labels */}
        <text x={width / 2} y={height - 3} textAnchor="middle" className="text-[9px] fill-[rgba(255,255,255,0.3)]">Predicted Probability</text>
        <text x={12} y={height / 2} textAnchor="middle" transform={`rotate(-90, 12, ${height / 2})`} className="text-[9px] fill-[rgba(255,255,255,0.3)]">Actual Hit Rate</text>
      </svg>
    </div>
  );
}

/* ═══════ Bucket Bar ═══════ */
function BucketBar({ label, value, total, roi, color }: {
  label: string; value: number; total: number; roi?: number; color: "cyan" | "purple";
}) {
  const barColor = color === "cyan" ? "from-cyan-500/30 to-cyan-500/50" : "from-purple-500/30 to-purple-500/50";
  return (
    <div className="flex items-center gap-2 group">
      <span className="w-16 text-xs font-mono text-muted-foreground">{label}</span>
      <div className="flex-1 h-6 rounded bg-white/[0.03] overflow-hidden relative">
        <div
          className={cn("h-full rounded bg-gradient-to-r transition-all group-hover:opacity-80", barColor)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
        <span className="absolute inset-y-0 flex items-center px-2 text-[10px] font-mono font-semibold">
          {value}%
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground/50 w-12 text-right">n={total}</span>
      {roi !== undefined && (
        <span className={cn("text-[10px] font-mono w-14 text-right", roi > 0 ? "text-emerald-400" : "text-red-400")}>
          {roi > 0 ? "+" : ""}{roi}%
        </span>
      )}
    </div>
  );
}

/* ═══════ Comparison Card ═══════ */
function ComparisonCard({ title, icon, data, labelKey }: {
  title: string; icon: React.ReactNode; data: any[]; labelKey: string;
}) {
  const sorted = [...data].sort((a, b) => b.hitRate - a.hitRate);
  return (
    <div className="rounded-xl border border-white/5 bg-card/50 p-4">
      <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
        {icon} {title}
      </h3>
      <div className="space-y-2">
        {sorted.map((d: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="font-medium">{d[labelKey]}</span>
            <div className="flex items-center gap-2">
              <span className={cn("font-mono font-semibold", d.hitRate > 55 ? "text-emerald-400" : d.hitRate < 45 ? "text-red-400" : "text-muted-foreground")}>
                {d.hitRate}%
              </span>
              <span className="text-[10px] text-muted-foreground/50">({d.total})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ Player Performance List ═══════ */
function PlayerPerfList({ title, players, positive }: { title: string; players: any[]; positive: boolean }) {
  if (!players.length) return null;
  return (
    <div className="rounded-xl border border-white/5 bg-card/50 p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {players.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={cn(
                "size-6 rounded-lg flex items-center justify-center text-[10px] font-bold",
                positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
              )}>
                {i + 1}
              </span>
              <span className="font-medium">{p.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("font-mono font-semibold", positive ? "text-emerald-400" : "text-red-400")}>
                {p.hitRate}%
              </span>
              <span className="text-muted-foreground/50">({p.total})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
