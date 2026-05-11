import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  ArrowUpDown, TrendingUp, Target, DollarSign,
  BarChart3, Trophy, X, ChevronRight,
} from "lucide-react";
import {
  DemoBanner, ResultStatusBadge, EdgeBadge, EmptyState, SkeletonCard, SkeletonTable,
} from "@/components/propedge";
import { cn } from "@/lib/utils";

export function ResultsPage() {
  const results = useQuery(api.results.myResults, {});
  const summary = useQuery(api.results.resultsSummary);
  const [filterSport, setFilterSport] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState<string>("pickedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [detailRow, setDetailRow] = useState<any>(null);

  const loading = results === undefined;

  const filteredResults = (results || []).filter((r: any) => {
    if (filterSport && r.sport !== filterSport) return false;
    if (filterPlatform && r.platform !== filterPlatform) return false;
    if (filterStatus && r.resultStatus !== filterStatus) return false;
    return true;
  }).sort((a: any, b: any) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    return sortDir === "desc" ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
  });

  const sports = [...new Set((results || []).map((r: any) => r.sport))];
  const platforms = [...new Set((results || []).map((r: any) => r.platform))];

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  // Compute best sport / best prop type from results
  const computeBest = (field: string) => {
    const graded = (results || []).filter((r: any) => r.resultStatus === "won" || r.resultStatus === "lost");
    const buckets: Record<string, { w: number; t: number }> = {};
    for (const r of graded) {
      const key = (r as any)[field] || "Other";
      if (!buckets[key]) buckets[key] = { w: 0, t: 0 };
      buckets[key].t++;
      if (r.resultStatus === "won") buckets[key].w++;
    }
    return Object.entries(buckets)
      .map(([k, v]) => ({ label: k, winRate: v.t > 0 ? Math.round((v.w / v.t) * 1000) / 10 : 0, total: v.t }))
      .sort((a, b) => b.winRate - a.winRate);
  };

  const bestSports = computeBest("sport");
  const bestPropTypes = computeBest("statType");

  return (
    <div className="space-y-5">
      <DemoBanner message="DEMO DATA — Results shown are mock grading data. Connect live stat APIs for real results." />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Results & Grading
        </h1>
      </div>

      {/* Summary Cards */}
      {summary ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SummaryCard
            label="Win Rate"
            value={`${summary.winRate}%`}
            icon={<Trophy className="size-4" />}
            color="text-emerald-400"
            bgColor="from-emerald-500/5"
          />
          <SummaryCard
            label="Won / Lost"
            value={`${summary.won}W — ${summary.lost}L`}
            icon={<Target className="size-4" />}
            color="text-white"
            bgColor="from-white/5"
          />
          <SummaryCard
            label="Avg Edge"
            value={`${summary.avgEdge > 0 ? "+" : ""}${summary.avgEdge}%`}
            icon={<TrendingUp className="size-4" />}
            color={summary.avgEdge > 0 ? "text-emerald-400" : "text-red-400"}
            bgColor={summary.avgEdge > 0 ? "from-emerald-500/5" : "from-red-500/5"}
          />
          <SummaryCard
            label="Avg CLV"
            value={`${summary.avgCLV > 0 ? "+" : ""}${summary.avgCLV}`}
            icon={<DollarSign className="size-4" />}
            color={summary.avgCLV > 0 ? "text-emerald-400" : "text-red-400"}
            bgColor={summary.avgCLV > 0 ? "from-emerald-500/5" : "from-red-500/5"}
          />
          <SummaryCard
            label="Pending"
            value={`${summary.pending}`}
            icon={<BarChart3 className="size-4" />}
            color="text-blue-400"
            bgColor="from-blue-500/5"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Charts Row */}
      {summary && summary.total > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Status Donut */}
          <div className="rounded-xl border border-white/5 bg-card/50 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Status Breakdown</h3>
            <StatusDonut won={summary.won} lost={summary.lost} push={summary.push} voided={summary.voided} pending={summary.pending} />
          </div>

          {/* Best Sport */}
          <div className="rounded-xl border border-white/5 bg-card/50 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Win Rate by Sport</h3>
            <div className="space-y-2">
              {bestSports.slice(0, 4).map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-12 text-xs font-medium">{s.label}</span>
                  <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded bg-gradient-to-r from-emerald-500/30 to-emerald-500/50"
                      style={{ width: `${s.winRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold w-14 text-right">{s.winRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best Prop Type */}
          <div className="rounded-xl border border-white/5 bg-card/50 p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Win Rate by Prop Type</h3>
            <div className="space-y-2">
              {bestPropTypes.slice(0, 4).map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-24 text-xs font-medium truncate">{s.label}</span>
                  <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded bg-gradient-to-r from-cyan-500/30 to-cyan-500/50"
                      style={{ width: `${s.winRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold w-14 text-right">{s.winRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterSelect value={filterSport} onChange={setFilterSport} label="All Sports" options={sports} />
        <FilterSelect value={filterPlatform} onChange={setFilterPlatform} label="All Platforms" options={platforms} />
        <FilterSelect
          value={filterStatus}
          onChange={setFilterStatus}
          label="All Statuses"
          options={["won", "lost", "push", "void", "pending"]}
        />
        {(filterSport || filterPlatform || filterStatus) && (
          <button
            onClick={() => { setFilterSport(""); setFilterPlatform(""); setFilterStatus(""); }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2"
          >
            <X className="size-3" /> Clear
          </button>
        )}
      </div>

      {/* Results Table */}
      {loading ? (
        <SkeletonTable rows={8} />
      ) : filteredResults.length === 0 ? (
        <EmptyState icon={BarChart3} title="No results found" description="Try adjusting your filters" />
      ) : (
        <div className="rounded-xl border border-white/5 bg-card/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Prop</th>
                  <th className="px-4 py-3">Dir</th>
                  <th className="px-4 py-3">Sport</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("pickLine")}>
                    <span className="flex items-center gap-1">Line <ArrowUpDown className="size-3" /></span>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("actualStat")}>
                    <span className="flex items-center gap-1">Actual <ArrowUpDown className="size-3" /></span>
                  </th>
                  <th className="px-4 py-3">Margin</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("pickEdge")}>
                    <span className="flex items-center gap-1">Edge <ArrowUpDown className="size-3" /></span>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("clv")}>
                    <span className="flex items-center gap-1">CLV <ArrowUpDown className="size-3" /></span>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("roi")}>
                    <span className="flex items-center gap-1">ROI <ArrowUpDown className="size-3" /></span>
                  </th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r: any, i: number) => {
                  // Fix impossible negative stats
                  const actualStat = r.actualStat !== undefined ? Math.max(0, Math.round(r.actualStat * 10) / 10) : undefined;
                  // Direction-aware margin: positive = pick beat the line
                  const margin = actualStat !== undefined
                    ? Math.round((r.overUnder === "over" ? actualStat - r.pickLine : r.pickLine - actualStat) * 10) / 10
                    : undefined;

                  return (
                    <tr
                      key={i}
                      onClick={() => setDetailRow(detailRow === i ? null : i)}
                      className={cn(
                        "border-b border-white/[0.03] cursor-pointer transition-colors",
                        "hover:bg-white/[0.03]",
                        detailRow === i && "bg-white/[0.05]",
                      )}
                    >
                      <td className="px-4 py-2.5"><ResultStatusBadge status={r.resultStatus} size="xs" /></td>
                      <td className="px-4 py-2.5 font-medium text-sm">{r.playerName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.statType}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("text-[10px] font-bold", r.overUnder === "over" ? "text-emerald-400" : "text-red-400")}>
                          {r.overUnder === "over" ? "▲" : "▼"} {r.overUnder.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs">{r.sport}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.platform}</td>
                      <td className="px-4 py-2.5 font-mono text-sm">{r.pickLine}</td>
                      <td className="px-4 py-2.5 font-mono text-sm font-semibold">{actualStat ?? "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        {margin !== undefined ? (
                          <span className={margin > 0 ? "text-emerald-400" : margin < 0 ? "text-red-400" : "text-muted-foreground"}>
                            {margin > 0 ? "+" : ""}{margin}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5"><EdgeBadge edge={r.pickEdge} size="xs" /></td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        {r.clv !== undefined ? (
                          <span className={r.clv > 0 ? "text-emerald-400" : r.clv < 0 ? "text-red-400" : ""}>
                            {r.clv > 0 ? "+" : ""}{r.clv}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold">
                        {r.roi !== undefined ? (
                          <span className={r.roi > 0 ? "text-emerald-400" : r.roi < 0 ? "text-red-400" : ""}>
                            {r.roi > 0 ? "+" : ""}{r.roi}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <ChevronRight className={cn("size-3.5 text-muted-foreground/30 transition-transform", detailRow === i && "rotate-90")} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Inline detail row */}
          {detailRow !== null && filteredResults[detailRow] && (
            <DetailDrawerInline result={filteredResults[detailRow]} onClose={() => setDetailRow(null)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════ Summary Card ═══════ */
function SummaryCard({ label, value, icon, color, bgColor }: {
  label: string; value: string; icon: React.ReactNode; color: string; bgColor: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/5 bg-gradient-to-br to-transparent p-4", bgColor)}>
      <div className="flex items-center gap-2 text-muted-foreground/60 text-[10px] uppercase tracking-wider mb-2">
        {icon} {label}
      </div>
      <p className={cn("text-xl font-bold font-mono", color)}>{value}</p>
    </div>
  );
}

/* ═══════ Filter Select ═══════ */
function FilterSelect({ value, onChange, label, options }: {
  value: string; onChange: (v: string) => void; label: string; options: string[];
}) {
  return (
    <select
      className="rounded-xl border border-white/10 bg-card/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ═══════ Status Donut ═══════ */
function StatusDonut({ won, lost, push, voided, pending }: { won: number; lost: number; push: number; voided: number; pending: number }) {
  const total = won + lost + push + voided + pending;
  if (total === 0) return null;

  const segments = [
    { count: won, color: "#10b981", label: "Won" },
    { count: lost, color: "#ef4444", label: "Lost" },
    { count: push, color: "#f59e0b", label: "Push" },
    { count: voided, color: "#71717a", label: "Void" },
    { count: pending, color: "#3b82f6", label: "Pending" },
  ];

  let acc = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          {segments.map((seg, i) => {
            const pct = seg.count / total;
            const offset = acc;
            acc += pct;
            if (pct === 0) return null;
            return (
              <circle
                key={i}
                cx="50" cy="50" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="10"
                strokeDasharray={`${pct * circumference} ${circumference}`}
                strokeDashoffset={-offset * circumference}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>
      <div className="space-y-1">
        {segments.filter((s) => s.count > 0).map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <div className="size-2 rounded-full" style={{ background: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-mono font-semibold">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ Inline Detail Drawer ═══════ */
function DetailDrawerInline({ result, onClose }: { result: any; onClose: () => void }) {
  const r = result;
  const actualStat = r.actualStat !== undefined ? Math.max(0, Math.round(r.actualStat * 10) / 10) : undefined;
  const margin = actualStat !== undefined ? Math.round((actualStat - r.pickLine) * 10) / 10 : undefined;

  return (
    <div className="border-t border-white/10 bg-white/[0.02] px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">{r.playerName} — {r.statType} {r.overUnder}</h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <DetailStat label="Line" value={r.pickLine} />
        <DetailStat label="Actual" value={actualStat ?? "Pending"} />
        <DetailStat label="Margin" value={margin !== undefined ? `${margin > 0 ? "+" : ""}${margin}` : "—"} color={margin && margin > 0 ? "text-emerald-400" : margin && margin < 0 ? "text-red-400" : undefined} />
        <DetailStat label="Closing Line" value={r.closingLine?.toFixed(1) ?? "—"} />
        <DetailStat label="Model Prob" value={r.pickModelProb ? `${r.pickModelProb}%` : "—"} />
        <DetailStat label="Market Implied" value={r.pickMarketImpliedProb ? `${r.pickMarketImpliedProb}%` : "—"} />
        <DetailStat label="Edge" value={`${r.pickEdge > 0 ? "+" : ""}${r.pickEdge}%`} color={r.pickEdge > 0 ? "text-emerald-400" : "text-red-400"} />
        <DetailStat label="CLV" value={r.clv !== undefined ? `${r.clv > 0 ? "+" : ""}${r.clv}` : "—"} color={r.clv > 0 ? "text-emerald-400" : r.clv < 0 ? "text-red-400" : undefined} />
        <DetailStat label="EV" value={r.ev !== undefined ? `${r.ev > 0 ? "+" : ""}${r.ev}` : "—"} />
        <DetailStat label="ROI" value={r.roi !== undefined ? `${r.roi > 0 ? "+" : ""}${r.roi}%` : "—"} color={r.roi > 0 ? "text-emerald-400" : r.roi < 0 ? "text-red-400" : undefined} />
        <DetailStat label="Picked" value={new Date(r.pickedAt).toLocaleDateString()} />
        <DetailStat label="Graded" value={r.gradedAt ? new Date(r.gradedAt).toLocaleDateString() : "Pending"} />
      </div>
    </div>
  );
}

function DetailStat({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-2">
      <div className="text-[10px] text-muted-foreground/50 mb-0.5">{label}</div>
      <div className={cn("font-mono font-semibold text-sm", color)}>{value}</div>
    </div>
  );
}
