import {
  BarChart3,
  CheckCircle2,
  DollarSign,
  LayoutGrid,
  List,
  MinusCircle,
  Target,
  TrendingUp,
  Trophy,
  X,
  XCircle,
  Brain,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useResults, useResultsSummary } from "../hooks/api/useResults";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/propedge/PageTransition";
import { Button } from "@/components/ui/button";

export function ResultsPage() {
  const { data: results, isLoading: resultsLoading } = useResults();
  const { data: summary } = useResultsSummary();
  const [filterSport, setFilterSport] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortField] = useState<string>("pickedAt");
  const [sortDir] = useState<"asc" | "desc">("desc");

  const loading = resultsLoading;

  const filteredResults = useMemo(() => {
    return (results || [])
      .filter((r: any) => {
        if (filterSport && r.sport !== filterSport) return false;
        if (filterPlatform && r.platform !== filterPlatform) return false;
        if (filterStatus && r.resultStatus !== filterStatus) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        const aVal = a[sortField] ?? 0;
        const bVal = b[sortField] ?? 0;
        return sortDir === "desc" ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
      });
  }, [results, filterSport, filterPlatform, filterStatus, sortField, sortDir]);

  const sports = [...new Set((results || []).map((r: any) => r.sport))].filter(Boolean);
  const platforms = [...new Set((results || []).map((r: any) => r.platform))].filter(Boolean);

  const winCount = summary?.wins ?? filteredResults.filter((r: any) => r.resultStatus === 'win').length;
  const lossCount = summary?.losses ?? filteredResults.filter((r: any) => r.resultStatus === 'loss').length;
  const pushCount = filteredResults.filter((r: any) => r.resultStatus === 'push').length;
  const totalGraded = winCount + lossCount + pushCount;
  const winRate = totalGraded > 0 ? ((winCount / totalGraded) * 100).toFixed(1) : '0.0';
  const totalROI = summary?.roi ?? 0;
  const avgCLV = summary?.avgClv ?? 0;

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-24">
        <AnimatedSportsBackground />
        
        <div className="relative z-10 px-4 lg:px-8 space-y-6 pt-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                <Trophy className="size-8 text-amber-400" />
                Results & Grading
              </h1>
              <p className="text-sm text-muted-foreground/50 mt-1">Track model performance and learn from every pick</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
              <Button 
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'} 
                size="sm" onClick={() => setViewMode('cards')}
                className="h-8 gap-2 rounded-lg text-xs font-bold"
              >
                <LayoutGrid className="size-3.5" /> Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                size="sm" onClick={() => setViewMode('table')}
                className="h-8 gap-2 rounded-lg text-xs font-bold"
              >
                <List className="size-3.5" /> Advanced
              </Button>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <SummaryCard label="Win Rate" value={`${winRate}%`} icon={<Target className="size-5" />} color="#00ff88" />
            <SummaryCard label="Record" value={`${winCount}W - ${lossCount}L`} icon={<Trophy className="size-5" />} color="#ffb800" sub={pushCount > 0 ? `${pushCount} Push` : undefined} />
            <SummaryCard label="Total ROI" value={`${totalROI > 0 ? '+' : ''}${totalROI}%`} icon={<DollarSign className="size-5" />} color={totalROI >= 0 ? "#00ff88" : "#ff4466"} />
            <SummaryCard label="Avg CLV" value={`${avgCLV > 0 ? '+' : ''}${avgCLV}%`} icon={<TrendingUp className="size-5" />} color="#00d4ff" />
            <SummaryCard label="Total Graded" value={totalGraded.toString()} icon={<BarChart3 className="size-5" />} color="#a855f7" />
          </div>

          {/* Filter Bar */}
          <div className="sticky-filter-bar">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Pills */}
              <div className="pill-selector">
                {[
                  { value: '', label: 'All' },
                  { value: 'win', label: '✓ Wins' },
                  { value: 'loss', label: '✗ Losses' },
                  { value: 'push', label: '— Push' },
                ].map(s => (
                  <button
                    key={s.value}
                    onClick={() => setFilterStatus(s.value)}
                    className={cn("pill-item text-[10px]", filterStatus === s.value ? "pill-item-active" : "pill-item-inactive")}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Sport filter */}
              {sports.length > 0 && (
                <select
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-bold text-muted-foreground appearance-none cursor-pointer"
                >
                  <option value="">All Sports</option>
                  {sports.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                </select>
              )}

              {/* Platform filter */}
              {platforms.length > 0 && (
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-bold text-muted-foreground appearance-none cursor-pointer"
                >
                  <option value="">All Platforms</option>
                  {platforms.map(p => <option key={p as string} value={p as string}>{p as string}</option>)}
                </select>
              )}

              {(filterSport || filterPlatform || filterStatus) && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterSport(''); setFilterPlatform(''); setFilterStatus(''); }} className="h-9 text-xs text-muted-foreground">
                  <X className="size-3 mr-1" /> Clear
                </Button>
              )}

              <div className="ml-auto text-[10px] font-bold text-muted-foreground/40">
                {filteredResults.length} results
              </div>
            </div>
          </div>

          {/* Card View */}
          {viewMode === 'cards' ? (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-56 rounded-2xl shimmer border border-white/[0.04]" />
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.03}>
                {filteredResults.map((r: any) => (
                  <StaggerItem key={r._id || r.id}>
                    <ResultCard result={r} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <EmptyResults />
            )
          ) : (
            /* Table View */
            loading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl shimmer border border-white/[0.04]" />
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="premium-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Player', 'Prop', 'Line', 'Result', 'Edge', 'CLV', 'Sport', 'Platform'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((r: any) => (
                        <tr key={r._id || r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-[9px] font-black text-white/20">
                                {r.playerName?.split(' ').map((n: any) => n[0]).join('')}
                              </div>
                              <span className="text-sm font-bold text-white">{r.playerName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{formatLabel(r.statType)}</td>
                          <td className="px-4 py-3 text-sm font-mono font-bold text-white">{r.line}</td>
                          <td className="px-4 py-3"><ResultBadge status={r.resultStatus} actual={r.actual} /></td>
                          <td className="px-4 py-3">
                            <span className={cn("text-sm font-mono font-bold", r.edge > 0 ? "text-primary" : "text-red-400")}>
                              {r.edge > 0 ? '+' : ''}{r.edge?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{r.clv ? `${r.clv > 0 ? '+' : ''}${r.clv}%` : '—'}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground/60 uppercase">{r.sport}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground/60 uppercase">{r.platform}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyResults />
            )
          )}
        </div>
      </div>
    </PageTransition>
  );
}

/* ═══ Result Card ═══ */
function ResultCard({ result: r }: { result: any }) {
  const isWin = r.resultStatus === 'win';
  const isLoss = r.resultStatus === 'loss';
  const _isPush = r.resultStatus === 'push'; void _isPush;
  
  const borderColor = isWin ? 'border-emerald-500/20' : isLoss ? 'border-red-500/20' : 'border-amber-500/20';
  const bgAccent = isWin ? 'bg-emerald-500/[0.03]' : isLoss ? 'bg-red-500/[0.03]' : 'bg-amber-500/[0.03]';
  const statusColor = isWin ? '#00ff88' : isLoss ? '#ff4466' : '#ffb800';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn("relative rounded-2xl border overflow-hidden transition-all", borderColor, bgAccent)}
    >
      {/* Top accent line */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${statusColor}60, transparent)` }} />

      <div className="p-5 space-y-4">
        {/* Player + Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm font-black text-white/20 overflow-hidden">
              {r.playerImage ? (
                <img src={r.playerImage} className="h-full w-full object-cover" />
              ) : (
                r.playerName?.split(' ').map((n: any) => n[0]).join('')
              )}
            </div>
            <div>
              <p className="font-bold text-[15px] text-white leading-tight">{r.playerName}</p>
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider mt-0.5">
                {r.team} · {formatLabel(r.statType)}
              </p>
            </div>
          </div>
          <ResultBadge status={r.resultStatus} actual={r.actual} />
        </div>

        {/* Line vs Actual */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.03] rounded-xl p-3 text-center">
            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Line</p>
            <p className="text-xl font-black text-white font-mono">{r.line}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3 text-center">
            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Actual</p>
            <p className="text-xl font-black font-mono" style={{ color: statusColor }}>{r.actual ?? '—'}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3 text-center">
            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Margin</p>
            <p className={cn("text-xl font-black font-mono", isWin ? "text-primary" : isLoss ? "text-red-400" : "text-amber-400")}>
              {r.actual && r.line ? (r.actual - r.line > 0 ? '+' : '') + (r.actual - r.line).toFixed(1) : '—'}
            </p>
          </div>
        </div>

        {/* Edge + CLV + ROI chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg border", r.edge > 0 ? "text-primary bg-primary/5 border-primary/10" : "text-red-400 bg-red-500/5 border-red-500/10")}>
            Edge: {r.edge > 0 ? '+' : ''}{r.edge?.toFixed(1)}%
          </span>
          {r.clv !== undefined && (
            <span className="text-[10px] font-black px-2 py-1 rounded-lg border text-cyan-400 bg-cyan-500/5 border-cyan-500/10">
              CLV: {r.clv > 0 ? '+' : ''}{r.clv}%
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04] text-muted-foreground/50">
            {r.sport} · {r.platform}
          </span>
        </div>

        {/* Model Learning Note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/10">
          <Brain className="size-3.5 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-indigo-300/70 leading-relaxed">
            {isWin 
              ? `Model correctly identified ${r.edge?.toFixed(1)}% edge on ${formatLabel(r.statType)}. Pattern reinforced for future predictions.`
              : isLoss 
                ? `Outcome variance detected. Model recalibrating ${formatLabel(r.statType)} weights for similar matchup profiles.`
                : `Push result — line was accurate. Model confidence maintained.`
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Result Badge ═══ */
function ResultBadge({ status }: { status: string; actual?: number }) {
  const config: Record<string, any> = {
    win: { icon: CheckCircle2, color: '#00ff88', bg: '#00ff8815', label: 'WIN' },
    loss: { icon: XCircle, color: '#ff4466', bg: '#ff446615', label: 'LOSS' },
    push: { icon: MinusCircle, color: '#ffb800', bg: '#ffb80015', label: 'PUSH' },
  };
  const c = config[status] || config.push;
  const Icon = c.icon;
  
  return (
    <div 
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
      style={{ color: c.color, backgroundColor: c.bg }}
    >
      <Icon className="size-3.5" />
      {c.label}
    </div>
  );
}

/* ═══ Summary Card ═══ */
function SummaryCard({ label, value, icon, color, sub }: { label: string; value: string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <FadeIn>
      <motion.div 
        whileHover={{ y: -3 }}
        className="premium-card rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-3" style={{ color }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
            {icon}
          </div>
        </div>
        <p className="metric-label mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tighter text-white font-mono">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground/40 mt-1">{sub}</p>}
      </motion.div>
    </FadeIn>
  );
}

/* ═══ Empty State ═══ */
function EmptyResults() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/[0.08] rounded-3xl">
      <div className="size-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <Trophy className="size-8 text-muted-foreground/30" />
      </div>
      <h3 className="text-xl font-bold text-white">No Results Yet</h3>
      <p className="text-sm text-muted-foreground/40 mt-1">Results will appear once picks are graded</p>
    </div>
  );
}
