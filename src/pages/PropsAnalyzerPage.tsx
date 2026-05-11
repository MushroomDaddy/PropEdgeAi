import { useQuery, useMutation } from "convex/react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  DollarSign,
  History,
  Search,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

const SPORTS = ["All", "NBA", "NFL", "MLB", "NHL"];
const PLATFORMS = ["All", "PrizePicks", "Underdog", "Sleeper", "DraftKings Pick6", "Kalshi"];
const PROP_TYPES = [
  { value: "All", label: "All Props" },
  { value: "over_under", label: "Over/Under" },
  { value: "moneyline", label: "Moneyline" },
  { value: "spread", label: "Spread" },
  { value: "total", label: "Game Total" },
  { value: "first_scorer", label: "Scorer Props" },
  { value: "alt_line", label: "Alt Lines" },
  { value: "player_special", label: "Player Specials" },
];

type SortKey = "edge" | "confidence" | "hitRate" | "line" | "projection" | "matchupRating" | "dvpRank" | "last10Hits" | "impliedProb" | "bustRisk" | "valueScore";
type SortDir = "asc" | "desc";

export function PropsAnalyzerPage() {
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [propType, setPropType] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("valueScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedProp, setSelectedProp] = useState<any>(null);

  const allProps = useQuery(api.props.list, {
    sport: sport === "All" ? undefined : sport,
    platform: platform === "All" ? undefined : platform,
  });
  const addPick = useMutation(api.picks.addPick);

  const filteredProps = useMemo(() => {
    if (!allProps) return [];
    let filtered = allProps;
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.playerName.toLowerCase().includes(lower) ||
          p.team.toLowerCase().includes(lower) ||
          p.statType.toLowerCase().includes(lower)
      );
    }
    if (propType !== "All") {
      filtered = filtered.filter((p: any) => (p.propType || "over_under") === propType);
    }
    filtered.sort((a: any, b: any) => {
      const aVal = sortKey === "edge" ? Math.abs(a[sortKey] || 0) : (a[sortKey] || 0);
      const bVal = sortKey === "edge" ? Math.abs(b[sortKey] || 0) : (b[sortKey] || 0);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return filtered;
  }, [allProps, search, sortKey, sortDir, propType]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const handleAddPick = async (propId: any) => {
    try {
      await addPick({ propId });
      toast.success("Pick added to builder!");
    } catch { toast.error("Failed to add pick"); }
  };

  const SortHeader = ({ label, sortKeyName, align = "right" }: { label: string; sortKeyName: SortKey; align?: string }) => (
    <th
      className={`p-3 font-medium cursor-pointer hover:text-white transition-colors ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => toggleSort(sortKeyName)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {label}
        {sortKey === sortKeyName ? (
          sortDir === "desc" ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />
        ) : (
          <ArrowUpDown className="size-3 opacity-30" />
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-5 max-w-[1500px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="size-6 text-[#00D4FF]" />
          Prop Analyzer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search, filter, and analyze player props with deep statistical insights
        </p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search player, team, or prop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#111827] border-[#1E293B] text-white placeholder:text-[#4B5A78] focus:border-[#00FF88]/50 focus:ring-[#00FF88]/20"
          />
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-[#111827] rounded-lg border border-[#1E293B]">
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                sport === s ? "bg-[#00FF88]/15 text-[#00FF88]" : "text-[#7B8BA8] hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="appearance-none bg-[#111827] border border-[#1E293B] text-sm text-[#C8D0E0] rounded-lg px-3 py-2 pr-8 focus:border-[#00FF88]/50 focus:outline-none cursor-pointer"
          >
            {PLATFORMS.map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={propType}
            onChange={(e) => setPropType(e.target.value)}
            className="appearance-none bg-[#111827] border border-[#1E293B] text-sm text-[#C8D0E0] rounded-lg px-3 py-2 pr-8 focus:border-[#00FF88]/50 focus:outline-none cursor-pointer"
          >
            {PROP_TYPES.map((pt) => (<option key={pt.value} value={pt.value}>{pt.label}</option>))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
        <div className="text-xs text-muted-foreground">{filteredProps.length} props found</div>
      </div>

      {/* Main Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#7B8BA8]">
                <th className="text-left p-3 font-medium">Player</th>
                <th className="text-left p-3 font-medium">Prop</th>
                <SortHeader label="Line" sortKeyName="line" />
                <SortHeader label="Proj" sortKeyName="projection" />
                <SortHeader label="Edge" sortKeyName="edge" />
                <SortHeader label="Value" sortKeyName="valueScore" />
                <SortHeader label="Conf." sortKeyName="confidence" />
                <th className="text-center p-3 font-medium">Consensus</th>
                <th className="text-center p-3 font-medium">Streak</th>
                <SortHeader label="Bust" sortKeyName="bustRisk" />
                <th className="text-center p-3 font-medium">Pick</th>
                <th className="text-left p-3 font-medium">Platform</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProps.map((prop: any) => {
                const consensus = prop.projectionConsensus;
                const streak = prop.hotColdStreak;
                return (
                  <tr
                    key={prop._id}
                    className="border-b border-[#1E293B]/50 hover:bg-[#1A2236]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedProp(selectedProp?._id === prop._id ? null : prop)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <InjuryDot status={prop.injuryStatus || "healthy"} />
                        <div>
                          <div className="font-medium text-white">{prop.playerName}</div>
                          <div className="text-xs text-muted-foreground">{prop.team} · {prop.sport}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[#C8D0E0]">{prop.statType}</td>
                    <td className="p-3 text-right font-mono text-[#C8D0E0]">{prop.line}</td>
                    <td className="p-3 text-right font-mono font-medium text-white">{prop.projection}</td>
                    <td className="p-3 text-right">
                      <span className={`font-mono font-bold ${
                        prop.edge > 5 ? "text-[#00FF88]" : prop.edge > 0 ? "text-[#00FF88]/70" : prop.edge > -5 ? "text-[#FFB800]" : "text-[#FF4466]"
                      }`}>
                        {prop.edge > 0 ? "+" : ""}{prop.edge}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <ValueScoreBadge score={prop.valueScore} />
                    </td>
                    <td className="p-3 text-right"><ConfidenceBadge value={prop.confidence} /></td>
                    <td className="p-3 text-center">
                      {consensus ? (
                        <ConsensusIndicator numOverLine={consensus.numOverLine} numSources={consensus.numSources} />
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      {streak ? (
                        <StreakBadge type={streak.type} label={streak.label} />
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-right"><BustRiskBadge value={prop.bustRisk} /></td>
                    <td className="p-3 text-center">
                      <Badge className={`text-xs font-bold ${
                        prop.overUnder === "over"
                          ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
                          : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                      }`}>
                        {prop.isKalshiMarket ? (prop.edge > 0 ? "YES" : "NO") : prop.overUnder.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                        prop.platform === "Kalshi" ? "text-[#A855F7] bg-[#A855F7]/10" : "text-muted-foreground bg-[#1A2236]"
                      }`}>{prop.platform}</span>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleAddPick(prop._id); }}
                        className="size-8 p-0 hover:bg-[#00FF88]/10 hover:text-[#00FF88]"
                      >
                        <ShoppingCart className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Prop Detail */}
      {selectedProp && (
        <div className="bg-[#111827] rounded-xl border border-[#00D4FF]/20 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{selectedProp.playerName} — {selectedProp.statType}</h3>
              <p className="text-sm text-muted-foreground">{selectedProp.team} · {selectedProp.sport} · {selectedProp.platform}</p>
            </div>
            <div className="flex items-center gap-3">
              <ValueScoreBadge score={selectedProp.valueScore} size="lg" />
              <Button onClick={() => handleAddPick(selectedProp._id)} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E17] font-bold" size="sm">
                <ShoppingCart className="size-3.5 mr-1" /> Add to Builder
              </Button>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-4">
            <MiniStat label="Line" value={selectedProp.line} />
            <MiniStat label="Projection" value={selectedProp.projection} />
            <MiniStat label="Edge" value={`${selectedProp.edge > 0 ? "+" : ""}${selectedProp.edge}%`} color={selectedProp.edge > 0 ? "#00FF88" : "#FF4466"} />
            <MiniStat label="Confidence" value={`${selectedProp.confidence}%`} color="#00D4FF" />
            <MiniStat label="Hit Rate" value={`${selectedProp.hitRate}%`} color="#FFB800" />
            <MiniStat label="Bust Risk" value={`${selectedProp.bustRisk ?? "?"}%`} color={(selectedProp.bustRisk || 40) <= 30 ? "#00FF88" : (selectedProp.bustRisk || 40) <= 55 ? "#FFB800" : "#FF4466"} />
            <MiniStat label="Value Score" value={`${selectedProp.valueScore ?? "—"}`} color="#A855F7" />
          </div>

          {/* R3: Projection Consensus Meter */}
          {selectedProp.projectionConsensus && (
            <div className="bg-[#0A0E17] rounded-lg border border-[#1E293B] p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="size-4 text-[#00D4FF]" />
                <span className="text-sm font-semibold text-white">Projection Consensus</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Avg Projection</div>
                  <div className={`text-lg font-bold font-mono ${selectedProp.projectionConsensus.avg > selectedProp.line ? "text-[#00FF88]" : "text-[#FF4466]"}`}>
                    {selectedProp.projectionConsensus.avg}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sources Over Line</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {selectedProp.projectionConsensus.numOverLine}/{selectedProp.projectionConsensus.numSources}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Source Spread</div>
                  <div className="text-lg font-bold font-mono text-[#FFB800]">±{selectedProp.projectionConsensus.spread}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">vs Line</div>
                  <div className="text-lg font-bold font-mono text-white">{selectedProp.line}</div>
                </div>
              </div>
              {/* Visual consensus bar */}
              <div className="relative h-3 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (selectedProp.projectionConsensus.numOverLine / selectedProp.projectionConsensus.numSources) * 100)}%`,
                    backgroundColor: selectedProp.projectionConsensus.numOverLine > selectedProp.projectionConsensus.numSources / 2 ? "#00FF88" : "#FF4466",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[#FF4466]">Under</span>
                <span className="text-[10px] text-[#00FF88]">Over</span>
              </div>
            </div>
          )}

          {/* R4: Monte Carlo Simulation — Improved Histogram Visualization */}
          {selectedProp.monteCarloSim && (
            <div className="bg-[#0A0E17] rounded-lg border border-[#A855F7]/20 p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="size-4 text-[#A855F7]" />
                <span className="text-sm font-semibold text-white">Monte Carlo Simulation</span>
                <span className="text-[10px] text-muted-foreground">({selectedProp.monteCarloSim.simulations.toLocaleString()} sims)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Hit Rate</div>
                  <div className={`text-lg font-bold font-mono ${selectedProp.monteCarloSim.hitRate >= 55 ? "text-[#00FF88]" : selectedProp.monteCarloSim.hitRate >= 45 ? "text-[#FFB800]" : "text-[#FF4466]"}`}>
                    {selectedProp.monteCarloSim.hitRate}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">P10 (Floor)</div>
                  <div className="text-lg font-bold font-mono text-[#FF4466]">{selectedProp.monteCarloSim.p10}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">P50 (Median)</div>
                  <div className="text-lg font-bold font-mono text-white">{selectedProp.monteCarloSim.p50}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">P90 (Ceiling)</div>
                  <div className="text-lg font-bold font-mono text-[#00FF88]">{selectedProp.monteCarloSim.p90}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Std Dev</div>
                  <div className="text-lg font-bold font-mono text-[#FFB800]">{selectedProp.monteCarloSim.stdDev}</div>
                </div>
              </div>
              {/* R4: Probability Distribution Histogram */}
              <div className="mb-2">
                <div className="text-[10px] text-muted-foreground mb-1">Probability Distribution</div>
                <MCHistogram
                  p10={selectedProp.monteCarloSim.p10}
                  p50={selectedProp.monteCarloSim.p50}
                  p90={selectedProp.monteCarloSim.p90}
                  line={selectedProp.line}
                  hitRate={selectedProp.monteCarloSim.hitRate}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px]">
                <span className="text-[#FF4466]">■ Below line ({100 - selectedProp.monteCarloSim.hitRate}%)</span>
                <span className="text-[#FFB800]">| Line: {selectedProp.line}</span>
                <span className="text-[#00FF88]">■ Above line ({selectedProp.monteCarloSim.hitRate}%)</span>
              </div>
            </div>
          )}

          {/* R4: Similar Line History (NEW) */}
          {selectedProp.historicalHitRate && (
            <div className="bg-[#0A0E17] rounded-lg border border-[#00D4FF]/20 p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <History className="size-4 text-[#00D4FF]" />
                <span className="text-sm font-semibold text-white">Similar Line History</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <div className="bg-[#111827] rounded-lg p-3 border border-[#1E293B]">
                  <div className="text-xs text-muted-foreground">Hit Rate on Similar Lines</div>
                  <div className="text-2xl font-bold font-mono text-[#00D4FF]">{selectedProp.historicalHitRate.similarLines}%</div>
                  <div className="text-[10px] text-muted-foreground">{selectedProp.historicalHitRate.sampleSize} game sample</div>
                </div>
                {selectedProp.historicalHitRate.vsTeam && (
                  <div className="bg-[#111827] rounded-lg p-3 border border-[#1E293B]">
                    <div className="text-xs text-muted-foreground">vs This Opponent</div>
                    <div className="text-2xl font-bold font-mono text-[#FFB800]">{selectedProp.historicalHitRate.vsTeam}%</div>
                    <div className="text-[10px] text-muted-foreground">Head-to-head hit rate</div>
                  </div>
                )}
                <div className="bg-[#111827] rounded-lg p-3 border border-[#1E293B]">
                  <div className="text-xs text-muted-foreground">Recent Form (L10)</div>
                  <div className="text-2xl font-bold font-mono text-white">{selectedProp.last10Hits || "?"}/10</div>
                  <div className="text-[10px] text-muted-foreground">
                    Trend: {selectedProp.last10Trend === "up" ? "🔺 Improving" : selectedProp.last10Trend === "down" ? "🔻 Declining" : "➡️ Stable"}
                  </div>
                </div>
              </div>
              {/* Visual hit rate progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Similar line hit rate</span>
                    <span className="text-[#00D4FF] font-mono">{selectedProp.historicalHitRate.similarLines}%</span>
                  </div>
                  <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00D4FF] rounded-full transition-all" style={{ width: `${selectedProp.historicalHitRate.similarLines}%` }} />
                  </div>
                </div>
                {selectedProp.historicalHitRate.vsTeam && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">vs opponent</span>
                      <span className="text-[#FFB800] font-mono">{selectedProp.historicalHitRate.vsTeam}%</span>
                    </div>
                    <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFB800] rounded-full transition-all" style={{ width: `${selectedProp.historicalHitRate.vsTeam}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hot/Cold + Bust Risk row */}
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {selectedProp.hotColdStreak && (
              <div className={`bg-[#0A0E17] rounded-lg border p-3 ${
                selectedProp.hotColdStreak.type === "hot" ? "border-[#FF6B35]/30" : selectedProp.hotColdStreak.type === "cold" ? "border-[#00D4FF]/30" : "border-[#1E293B]"
              }`}>
                <div className="text-xs text-muted-foreground mb-1">Streak Detection</div>
                <div className="text-xl font-bold">{selectedProp.hotColdStreak.label}</div>
                <div className="text-[10px] text-muted-foreground">
                  {selectedProp.hotColdStreak.type === "hot" ? "Player is outperforming projections" : selectedProp.hotColdStreak.type === "cold" ? "Player is underperforming recently" : "Consistent with projections"}
                </div>
              </div>
            )}
            {selectedProp.bustRisk != null && (
              <div className="bg-[#0A0E17] rounded-lg border border-[#1E293B] p-3">
                <div className="text-xs text-muted-foreground mb-1">Bust Risk</div>
                <div className={`text-xl font-bold font-mono ${selectedProp.bustRisk <= 30 ? "text-[#00FF88]" : selectedProp.bustRisk <= 55 ? "text-[#FFB800]" : "text-[#FF4466]"}`}>
                  {selectedProp.bustRisk}%
                </div>
                <div className="w-full h-1.5 bg-[#1E293B] rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${selectedProp.bustRisk}%`,
                    backgroundColor: selectedProp.bustRisk <= 30 ? "#00FF88" : selectedProp.bustRisk <= 55 ? "#FFB800" : "#FF4466",
                  }} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {selectedProp.bustRisk <= 30 ? "Low bust probability" : selectedProp.bustRisk <= 55 ? "Moderate bust risk" : "High bust risk — tread carefully"}
                </div>
              </div>
            )}
            <div className="bg-[#0A0E17] rounded-lg border border-[#1E293B] p-3">
              <div className="text-xs text-muted-foreground mb-1">Matchup Rating</div>
              <div className="text-xl font-bold font-mono text-white">{selectedProp.matchupRating}/10</div>
              <div className="text-[10px] text-muted-foreground">DvP Rank: #{selectedProp.dvpRank || "?"}</div>
            </div>
          </div>

          {/* Projection Sources */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
              <TrendingUp className="size-3.5 text-[#00D4FF]" /> Projection Sources
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {selectedProp.projectionSources?.map((src: any, i: number) => {
                const isOverLine = src.value > selectedProp.line;
                return (
                  <div key={i} className="bg-[#0A0E17] rounded-lg p-3 border border-[#1E293B]">
                    <div className="text-xs text-muted-foreground">{src.source}</div>
                    <div className={`text-lg font-bold font-mono ${isOverLine ? "text-[#00FF88]" : "text-[#FF4466]"}`}>{src.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kalshi-specific */}
          {selectedProp.isKalshiMarket && selectedProp.kalshiPayout && (
            <div className="bg-[#A855F7]/5 border border-[#A855F7]/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-4 text-[#A855F7]" />
                <span className="text-sm font-semibold text-[#A855F7]">Kalshi Market</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0A0E17] rounded-lg p-3 border border-[#1E293B]">
                  <div className="text-xs text-[#00FF88]">YES Payout</div>
                  <div className="text-xl font-bold font-mono text-[#00FF88]">{selectedProp.kalshiPayout.yesPayout.toFixed(2)}x</div>
                </div>
                <div className="bg-[#0A0E17] rounded-lg p-3 border border-[#1E293B]">
                  <div className="text-xs text-[#FF4466]">NO Payout</div>
                  <div className="text-xl font-bold font-mono text-[#FF4466]">{selectedProp.kalshiPayout.noPayout.toFixed(2)}x</div>
                </div>
              </div>
            </div>
          )}

          {/* Correlated Stats */}
          {selectedProp.correlatedWith && selectedProp.correlatedWith.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#7B8BA8] mb-2">Correlated Stats</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProp.correlatedWith.map((stat: string, i: number) => (
                  <Badge key={i} className="text-[10px] bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20">{stat}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// R4: Monte Carlo Histogram
function MCHistogram({ p10, p50, p90, line }: { p10: number; p50: number; p90: number; line: number; hitRate: number }) {
  const min = Math.min(p10, line) * 0.85;
  const max = Math.max(p90, line) * 1.15;
  const range = max - min || 1;
  const bars = 20;

  // Generate normal-ish distribution bars
  const barData = Array.from({ length: bars }, (_, i) => {
    const x = min + (range / bars) * (i + 0.5);
    const zScore = (x - p50) / (((p90 - p10) / 2.56) || 1); // approximate std dev from P10/P90
    const height = Math.exp(-0.5 * zScore * zScore);
    const isAboveLine = x >= line;
    return { x, height, isAboveLine };
  });

  const maxHeight = Math.max(...barData.map(b => b.height));
  const linePos = ((line - min) / range) * 100;

  return (
    <div className="relative h-16">
      <div className="flex items-end h-full gap-[1px]">
        {barData.map((bar, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all"
            style={{
              height: `${(bar.height / maxHeight) * 100}%`,
              backgroundColor: bar.isAboveLine ? "#00FF8840" : "#FF446640",
              minHeight: "2px",
            }}
          />
        ))}
      </div>
      {/* Line marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[#FFB800]"
        style={{ left: `${Math.max(2, Math.min(98, linePos))}%` }}
      />
      <div
        className="absolute -top-0.5 text-[8px] font-mono text-[#FFB800] whitespace-nowrap"
        style={{ left: `${Math.max(2, Math.min(85, linePos))}%` }}
      >
        Line
      </div>
    </div>
  );
}

// R4: Value Score Badge (table + detail)
function ValueScoreBadge({ score, size = "sm" }: { score?: number; size?: "sm" | "lg" }) {
  if (score == null) return null;
  const color = score >= 75 ? "#00FF88" : score >= 55 ? "#FFB800" : score >= 35 ? "#00D4FF" : "#FF4466";
  const bg = score >= 75 ? "bg-[#00FF88]/15" : score >= 55 ? "bg-[#FFB800]/15" : score >= 35 ? "bg-[#00D4FF]/15" : "bg-[#FF4466]/15";
  if (size === "lg") {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bg}`}>
        <Star className="size-4" style={{ color }} />
        <span className="text-sm font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    );
  }
  return (
    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${bg}`}>
      <Star className="size-2.5" style={{ color }} />
      <span className="text-[10px] font-bold font-mono" style={{ color }}>{score}</span>
    </div>
  );
}

function InjuryDot({ status }: { status: string }) {
  const color = status === "healthy" ? "bg-[#00FF88]" : status === "questionable" ? "bg-[#FFB800]" : status === "doubtful" ? "bg-[#FF4466]/70" : "bg-[#FF4466]";
  return <div className={`size-1.5 rounded-full ${color} shrink-0`} />;
}

function ConfidenceBadge({ value }: { value: number }) {
  const color = value >= 75 ? "text-[#00FF88] bg-[#00FF88]/10" : value >= 55 ? "text-[#FFB800] bg-[#FFB800]/10" : "text-[#FF4466] bg-[#FF4466]/10";
  return <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${color}`}>{value}</span>;
}

function ConsensusIndicator({ numOverLine, numSources }: { numOverLine: number; numSources: number }) {
  const ratio = numOverLine / numSources;
  const color = ratio >= 0.7 ? "#00FF88" : ratio >= 0.4 ? "#FFB800" : "#FF4466";
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: numSources }).map((_, i) => (
          <div key={i} className="size-1.5 rounded-full" style={{ backgroundColor: i < numOverLine ? color : "#1E293B" }} />
        ))}
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{numOverLine}/{numSources}</span>
    </div>
  );
}

function StreakBadge({ type, label }: { type: string; label: string }) {
  if (type === "hot") return <span className="text-[10px] font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded">{label}</span>;
  if (type === "cold") return <span className="text-[10px] font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded">{label}</span>;
  return <span className="text-[10px] text-muted-foreground">{label}</span>;
}

function BustRiskBadge({ value }: { value?: number }) {
  if (value == null) return <span className="text-xs text-muted-foreground">—</span>;
  const color = value <= 30 ? "text-[#00FF88]" : value <= 55 ? "text-[#FFB800]" : "text-[#FF4466]";
  return <span className={`text-xs font-mono font-bold ${color}`}>{value}%</span>;
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-[#0A0E17] rounded-lg p-3 border border-[#1E293B]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold font-mono" style={{ color: color || "#E8ECF4" }}>{value}</div>
    </div>
  );
}
