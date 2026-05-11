import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  CheckCircle, XCircle, MinusCircle, Clock, Ban,
  ArrowUpDown, AlertTriangle,
} from "lucide-react";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  won: <CheckCircle className="size-4 text-[#00FF88]" />,
  lost: <XCircle className="size-4 text-red-400" />,
  push: <MinusCircle className="size-4 text-yellow-400" />,
  void: <Ban className="size-4 text-gray-400" />,
  pending: <Clock className="size-4 text-blue-400" />,
};

const STATUS_COLORS: Record<string, string> = {
  won: "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/20",
  push: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  void: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function ResultsPage() {
  const results = useQuery(api.results.myResults, {});
  const summary = useQuery(api.results.resultsSummary);
  const [filterSport, setFilterSport] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState<string>("pickedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredResults = (results || []).filter((r: any) => {
    if (filterSport && r.sport !== filterSport) return false;
    if (filterPlatform && r.platform !== filterPlatform) return false;
    if (filterStatus && r.resultStatus !== filterStatus) return false;
    return true;
  }).sort((a: any, b: any) => {
    const aVal = a[sortField] || 0;
    const bVal = b[sortField] || 0;
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const sports = [...new Set((results || []).map((r: any) => r.sport))];
  const platforms = [...new Set((results || []).map((r: any) => r.platform))];

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-6">
      {/* DEMO banner */}
      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-sm text-yellow-400">
        <AlertTriangle className="size-4" />
        <span>DEMO DATA — Results shown are mock grading data for demonstration. Connect live stat APIs for real results.</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00FF88] to-[#00D4FF] bg-clip-text text-transparent">
          Results & Grading
        </h1>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SumCard label="Win Rate" value={`${summary.winRate}%`} color="text-[#00FF88]" />
          <SumCard label="Won / Lost" value={`${summary.won} / ${summary.lost}`} color="text-white" />
          <SumCard label="Avg Edge" value={`${summary.avgEdge > 0 ? '+' : ''}${summary.avgEdge}%`} color={summary.avgEdge > 0 ? "text-[#00FF88]" : "text-red-400"} />
          <SumCard label="Avg CLV" value={`${summary.avgCLV > 0 ? '+' : ''}${summary.avgCLV}`} color={summary.avgCLV > 0 ? "text-[#00FF88]" : "text-red-400"} />
          <SumCard label="Pending" value={`${summary.pending}`} color="text-blue-400" />
        </div>
      )}

      {/* Status breakdown bar */}
      {summary && summary.total > 0 && (
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">{STATUS_ICONS.won} Won: {summary.won}</span>
            <span className="flex items-center gap-1">{STATUS_ICONS.lost} Lost: {summary.lost}</span>
            <span className="flex items-center gap-1">{STATUS_ICONS.push} Push: {summary.push}</span>
            <span className="flex items-center gap-1">{STATUS_ICONS.void} Void: {summary.voided}</span>
            <span className="flex items-center gap-1">{STATUS_ICONS.pending} Pending: {summary.pending}</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
            <div className="bg-[#00FF88]" style={{ width: `${(summary.won / summary.total) * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(summary.lost / summary.total) * 100}%` }} />
            <div className="bg-yellow-500" style={{ width: `${(summary.push / summary.total) * 100}%` }} />
            <div className="bg-gray-500" style={{ width: `${(summary.voided / summary.total) * 100}%` }} />
            <div className="bg-blue-500" style={{ width: `${(summary.pending / summary.total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className="rounded-lg border border-white/10 bg-card px-3 py-2 text-sm" value={filterSport} onChange={(e) => setFilterSport(e.target.value)}>
          <option value="">All Sports</option>
          {sports.map((s: string) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="rounded-lg border border-white/10 bg-card px-3 py-2 text-sm" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          {platforms.map((p: string) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="rounded-lg border border-white/10 bg-card px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="push">Push</option>
          <option value="void">Void</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="rounded-lg border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted-foreground uppercase">
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Player</th>
              <th className="px-3 py-3">Prop</th>
              <th className="px-3 py-3">Sport</th>
              <th className="px-3 py-3">Platform</th>
              <th className="px-3 py-3 cursor-pointer" onClick={() => toggleSort("pickLine")}>
                <span className="flex items-center gap-1">Line <ArrowUpDown className="size-3" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer" onClick={() => toggleSort("actualStat")}>
                <span className="flex items-center gap-1">Actual <ArrowUpDown className="size-3" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer" onClick={() => toggleSort("closingLine")}>
                <span className="flex items-center gap-1">Close <ArrowUpDown className="size-3" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer" onClick={() => toggleSort("pickEdge")}>
                <span className="flex items-center gap-1">Edge <ArrowUpDown className="size-3" /></span>
              </th>
              <th className="px-3 py-3">Model%</th>
              <th className="px-3 py-3">Mkt%</th>
              <th className="px-3 py-3 cursor-pointer" onClick={() => toggleSort("clv")}>
                <span className="flex items-center gap-1">CLV <ArrowUpDown className="size-3" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer" onClick={() => toggleSort("roi")}>
                <span className="flex items-center gap-1">ROI <ArrowUpDown className="size-3" /></span>
              </th>
              <th className="px-3 py-3 cursor-pointer" onClick={() => toggleSort("pickedAt")}>
                <span className="flex items-center gap-1">Picked <ArrowUpDown className="size-3" /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((r: any, i: number) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[r.resultStatus]}`}>
                    {STATUS_ICONS[r.resultStatus]}
                    {r.resultStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-medium">{r.playerName}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {r.statType} <span className={r.overUnder === "over" ? "text-[#00FF88]" : "text-red-400"}>({r.overUnder})</span>
                </td>
                <td className="px-3 py-2.5">{r.sport}</td>
                <td className="px-3 py-2.5 text-xs">{r.platform}</td>
                <td className="px-3 py-2.5 font-mono">{r.pickLine}</td>
                <td className="px-3 py-2.5 font-mono font-medium">
                  {r.actualStat !== undefined ? r.actualStat : "—"}
                </td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">
                  {r.closingLine !== undefined ? r.closingLine.toFixed(1) : "—"}
                </td>
                <td className="px-3 py-2.5 font-mono">
                  <span className={r.pickEdge > 0 ? "text-[#00FF88]" : "text-red-400"}>
                    {r.pickEdge > 0 ? "+" : ""}{r.pickEdge}%
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs">{r.pickModelProb || "—"}%</td>
                <td className="px-3 py-2.5 font-mono text-xs">{r.pickMarketImpliedProb || "—"}%</td>
                <td className="px-3 py-2.5 font-mono">
                  {r.clv !== undefined ? (
                    <span className={r.clv > 0 ? "text-[#00FF88]" : r.clv < 0 ? "text-red-400" : ""}>
                      {r.clv > 0 ? "+" : ""}{r.clv}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5 font-mono font-medium">
                  {r.roi !== undefined ? (
                    <span className={r.roi > 0 ? "text-[#00FF88]" : r.roi < 0 ? "text-red-400" : ""}>
                      {r.roi > 0 ? "+" : ""}{r.roi}%
                    </span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  {new Date(r.pickedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredResults.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No results yet.</div>
        )}
      </div>
    </div>
  );
}

function SumCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
