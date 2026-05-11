import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  ClipboardCopy,
  Lightbulb,
  Minus,
  Package,
  Plus,
  Shield,
  ShoppingCart,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";

const ENTRY_TYPES: Record<string, { id: string; label: string; desc: string; payout: string }[]> = {
  PrizePicks: [
    { id: "power", label: "Power Play", desc: "2-6 picks, all must hit", payout: "3x–25x" },
    { id: "flex", label: "Flex Play", desc: "3-6 picks, miss 1 still win", payout: "1.5x–5x" },
  ],
  Underdog: [
    { id: "flex", label: "Flex Play", desc: "Miss 1, still win reduced", payout: "0.5x–20x" },
    { id: "power", label: "Power Play", desc: "All must hit for max payout", payout: "3x–20x" },
  ],
  Sleeper: [
    { id: "standard", label: "Standard", desc: "Pick 2-6, all must hit", payout: "3x–25x" },
    { id: "insured", label: "Insured", desc: "Miss 1, still get paid", payout: "1x–10x" },
  ],
  "DraftKings Pick6": [
    { id: "standard", label: "Standard", desc: "6 picks, flex scoring", payout: "Variable" },
    { id: "tier", label: "Tier Play", desc: "Pick from tiered pool", payout: "Variable" },
  ],
  Kalshi: [
    { id: "single", label: "Single Market", desc: "YES/NO binary outcome", payout: "1.1x–10x" },
    { id: "multi", label: "Multi-Market", desc: "Combine 2+ markets", payout: "2x–50x" },
  ],
};

const PLATFORM_OPTIONS = ["PrizePicks", "Underdog", "Sleeper", "DraftKings Pick6", "Kalshi"];

const QUICK_PACKS = [
  { id: "bestEdge4", icon: "🎯", label: "Best Edge 4-Pack", desc: "Top absolute edge plays" },
  { id: "highConfidence3", icon: "🛡️", label: "High Confidence 3", desc: "Safest high-confidence picks" },
  { id: "balancedMix", icon: "⚖️", label: "Balanced EV Mix", desc: "2 overs + 2 unders" },
  { id: "topValue5", icon: "💎", label: "Top Value 5", desc: "Best composite Value Score" },
  { id: "prizePicksPower", icon: "⚡", label: "PP Power Play", desc: "4-pick power play" },
  { id: "underdogFlex", icon: "🐕", label: "UD 6-Pick Flex", desc: "Underdog flex optimized" },
  { id: "kalshiBest", icon: "💹", label: "Kalshi Best", desc: "Top Kalshi markets" },
];

export function PickBuilderPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("PrizePicks");
  const [entryType, setEntryType] = useState("flex");
  const [stake, setStake] = useState(10);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [showPackPreview, setShowPackPreview] = useState(false);
  const [lineAdjustments, setLineAdjustments] = useState<Record<string, number>>({});
  const entryRef = useRef<HTMLDivElement>(null);

  const myPicks = useQuery(api.picks.myPicks, { status: "pending" });
  const correlations = useQuery(api.picks.analyzeCorrelations, {});
  const quickPack = useQuery(api.picks.generateQuickPack, activePackId ? { packType: activePackId } : "skip");

  // R4: Auto-suggest diversification picks
  const currentSports = myPicks?.map((p: any) => p.sport) || [];
  const currentPlatforms = myPicks?.map((p: any) => p.platform) || [];
  const currentOU = myPicks?.map((p: any) => p.overUnder) || [];
  const suggestions = useQuery(api.props.suggestDiversificationPicks, 
    myPicks && myPicks.length >= 1 
      ? { currentPickSports: currentSports, currentPickPlatforms: currentPlatforms, currentOverUnder: currentOU } 
      : "skip"
  );

  const removePick = useMutation(api.picks.removePick);
  const addPick = useMutation(api.picks.addPick);
  const createEntry = useMutation(api.picks.createEntry);

  const platformEntryTypes = ENTRY_TYPES[selectedPlatform] || ENTRY_TYPES.PrizePicks;

  const handleRemovePick = async (pickId: any) => {
    try {
      await removePick({ pickId });
      toast.success("Pick removed");
    } catch {
      toast.error("Failed to remove pick");
    }
  };

  const handleAddFromPack = async (propId: any) => {
    try {
      await addPick({ propId });
      toast.success("Pick added from quick pack!");
    } catch {
      toast.error("Failed to add pick");
    }
  };

  const handleSubmitEntry = async () => {
    if (!myPicks || myPicks.length < 2) {
      toast.error("Need at least 2 picks for an entry");
      return;
    }
    try {
      await createEntry({
        pickIds: myPicks.map((p: any) => p._id),
        platform: selectedPlatform,
        entryType,
        stake,
      });
      toast.success("Entry created! 🎉");
    } catch {
      toast.error("Failed to create entry");
    }
  };

  // R4: Platform-specific copy formats
  const handleCopyForPlatform = (platform: string) => {
    if (!myPicks) return;
    let text = "";
    switch (platform) {
      case "PrizePicks":
        text = `PrizePicks ${entryType === "power" ? "Power" : "Flex"} Play ($${stake})\n`;
        text += myPicks.map((p: any) => {
          const adj = lineAdjustments[p._id] || 0;
          return `${p.playerName} ${p.overUnder.toUpperCase()} ${(p.line + adj).toFixed(1)} ${p.statType}`;
        }).join("\n");
        break;
      case "Underdog":
        text = `Underdog ${entryType === "power" ? "Power" : "Flex"} Entry\n`;
        text += myPicks.map((p: any) => {
          const adj = lineAdjustments[p._id] || 0;
          return `• ${p.playerName} | ${p.overUnder.toUpperCase()} ${(p.line + adj).toFixed(1)} ${p.statType} | ${p.sport}`;
        }).join("\n");
        break;
      case "Kalshi":
        text = `Kalshi Markets\n`;
        text += myPicks.map((p: any) => `${p.playerName} ${p.statType} — ${p.edge > 0 ? "YES" : "NO"} (Line: ${p.line}, Edge: ${p.edge > 0 ? "+" : ""}${p.edge}%)`).join("\n");
        break;
      default:
        text = myPicks.map((p: any) => `${p.playerName} ${p.overUnder.toUpperCase()} ${p.line} ${p.statType}`).join("\n");
    }
    navigator.clipboard.writeText(text);
    toast.success(`Copied for ${platform}! 📋`);
  };

  const handleSaveAsImage = () => {
    // Generate shareable text format
    if (!myPicks || myPicks.length === 0) return;
    let text = `🎯 PropEdge AI — ${selectedPlatform} ${entryType} Entry\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    myPicks.forEach((p: any, i: number) => {
      text += `${i + 1}. ${p.playerName} ${p.overUnder.toUpperCase()} ${p.line} ${p.statType} (${p.edge > 0 ? "+" : ""}${p.edge}% edge)\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Avg Edge: ${totalEdge}% | Stake: $${stake}\n`;
    text += `propedge.ai`;
    navigator.clipboard.writeText(text);
    toast.success("Entry card copied! Share it anywhere 🚀");
  };

  // R4: Manual line adjustment with EV recalc
  const adjustLine = (pickId: string, delta: number) => {
    setLineAdjustments(prev => ({
      ...prev,
      [pickId]: (prev[pickId] || 0) + delta,
    }));
  };

  const getAdjustedEdge = (pick: any) => {
    const adj = lineAdjustments[pick._id] || 0;
    if (adj === 0) return pick.edge;
    // Each 0.5 line movement ≈ 3-5% edge change
    const edgePerHalfPoint = pick.overUnder === "over" ? -4 : 4;
    return Math.round((pick.edge + adj * 2 * edgePerHalfPoint) * 10) / 10;
  };

  const totalEdge = myPicks && myPicks.length > 0
    ? Math.round((myPicks.reduce((sum: number, p: any) => sum + Math.abs(getAdjustedEdge(p) || 0), 0) / myPicks.length) * 10) / 10
    : 0;

  const divScore = correlations?.diversificationScore ?? 0;
  const divColor = divScore >= 70 ? "#00FF88" : divScore >= 40 ? "#FFB800" : "#FF4466";
  const divLabel = divScore >= 70 ? "Well Diversified" : divScore >= 40 ? "Moderate Risk" : "High Correlation";

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="size-6 text-[#A855F7]" />
            Pick Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build optimized entries with smart correlation detection & one-click quick packs
          </p>
        </div>
      </div>

      {/* Quick Packs */}
      <div className="bg-gradient-to-r from-[#A855F7]/5 via-[#00FF88]/5 to-[#00D4FF]/5 rounded-xl border border-[#A855F7]/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="size-4 text-[#A855F7]" />
          <span className="text-sm font-semibold text-white">Quick Packs — One-Click Build</span>
          <Badge className="text-[10px] bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/20">NEW</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {QUICK_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => { setActivePackId(pack.id); setShowPackPreview(true); }}
              className={`p-3 rounded-lg border text-left transition-all hover:scale-[1.02] ${
                activePackId === pack.id && showPackPreview
                  ? "bg-[#A855F7]/10 border-[#A855F7]/40 shadow-lg shadow-[#A855F7]/10"
                  : "bg-[#111827] border-[#1E293B] hover:border-[#A855F7]/30"
              }`}
            >
              <div className="text-lg mb-1">{pack.icon}</div>
              <div className="text-xs font-semibold text-white leading-tight">{pack.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{pack.desc}</div>
            </button>
          ))}
        </div>

        {/* Pack Preview */}
        {showPackPreview && quickPack && quickPack.picks?.length > 0 && (
          <div className="mt-3 bg-[#0A0E17] rounded-lg border border-[#A855F7]/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">{quickPack.name}</h4>
                <p className="text-xs text-muted-foreground">{quickPack.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Avg Edge</div>
                  <div className="text-sm font-mono font-bold text-[#00FF88]">{quickPack.avgEdge}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Avg Conf</div>
                  <div className="text-sm font-mono font-bold text-[#00D4FF]">{quickPack.avgConfidence}%</div>
                </div>
                <Button size="sm" onClick={() => setShowPackPreview(false)} variant="ghost" className="text-muted-foreground hover:text-white">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {quickPack.picks.map((p: any) => (
                <div key={p._id} className="flex items-center justify-between p-2 rounded-lg bg-[#111827] border border-[#1E293B]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge className={`text-[10px] font-bold shrink-0 ${
                      p.overUnder === "over" ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20" : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                    }`}>
                      {p.overUnder?.toUpperCase()}
                    </Badge>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{p.playerName}</div>
                      <div className="text-[10px] text-muted-foreground">{p.statType} · {p.line} · {p.sport}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-mono font-bold ${p.edge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}>
                      {p.edge > 0 ? "+" : ""}{p.edge}%
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleAddFromPack(p._id)} className="size-6 p-0 hover:bg-[#00FF88]/10 hover:text-[#00FF88]">
                      <ShoppingCart className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="mt-3 bg-[#A855F7] hover:bg-[#A855F7]/90 text-white font-bold"
              onClick={async () => {
                for (const p of quickPack.picks) {
                  try { await addPick({ propId: p._id }); } catch {}
                }
                toast.success(`Added ${quickPack.picks.length} picks from ${quickPack.name}!`);
                setShowPackPreview(false);
              }}
            >
              <Zap className="size-3.5 mr-1" />
              Add All {quickPack.picks.length} Picks
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Picks List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Platform-Specific Entry Types */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-4 text-[#00D4FF]" />
              <span className="text-sm font-semibold text-white">Platform & Entry Type</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setSelectedPlatform(p); setEntryType(ENTRY_TYPES[p]?.[0]?.id || "standard"); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedPlatform === p
                      ? "bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]"
                      : "bg-[#0A0E17] border-[#1E293B] text-muted-foreground hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {platformEntryTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setEntryType(type.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    entryType === type.id
                      ? "bg-[#A855F7]/10 border-[#A855F7]/30"
                      : "bg-[#0A0E17] border-[#1E293B] hover:border-[#1E293B]/80"
                  }`}
                >
                  <div className="text-sm font-semibold text-white">{type.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{type.desc}</div>
                  <div className="text-xs font-mono text-[#A855F7] mt-1">{type.payout}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Picks */}
          <div ref={entryRef} className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
            <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Zap className="size-4 text-[#00FF88]" />
                Your Picks ({myPicks?.length || 0})
              </h2>
              {/* R4: Export dropdown */}
              {myPicks && myPicks.length > 0 && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleCopyForPlatform(selectedPlatform)} className="text-xs text-muted-foreground hover:text-white gap-1">
                    <ClipboardCopy className="size-3" />
                    Copy for {selectedPlatform}
                  </Button>
                </div>
              )}
            </div>

            {!myPicks || myPicks.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No picks added yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Use a <span className="text-[#A855F7]">Quick Pack</span> above or go to the{" "}
                  <Link to="/props" className="text-[#00D4FF] hover:underline">Prop Analyzer</Link>{" "}
                  to add picks
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1E293B]/50">
                {myPicks.map((pick: any, idx: number) => {
                  const adj = lineAdjustments[pick._id] || 0;
                  const adjustedEdge = getAdjustedEdge(pick);
                  return (
                    <div key={pick._id} className="flex items-center gap-3 p-3 hover:bg-[#1A2236]/30 transition-colors">
                      <div className="size-6 rounded-full bg-[#1A2236] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{pick.playerName}</span>
                          <Badge className={`text-[10px] font-bold ${
                            pick.overUnder === "over"
                              ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
                              : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                          }`}>
                            {pick.overUnder?.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground bg-[#0A0E17] px-1.5 py-0.5 rounded">{pick.sport}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {pick.statType} · {pick.team || ""}
                        </div>
                        {/* R4: Manual line adjustment */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">Line:</span>
                          <button
                            onClick={() => adjustLine(pick._id, -0.5)}
                            className="size-4 rounded bg-[#1E293B] flex items-center justify-center hover:bg-[#FF4466]/20 text-muted-foreground hover:text-[#FF4466]"
                          >
                            <Minus className="size-2.5" />
                          </button>
                          <span className={`text-xs font-mono font-bold ${adj !== 0 ? "text-[#FFB800]" : "text-white"}`}>
                            {(pick.line + adj).toFixed(1)}
                          </span>
                          <button
                            onClick={() => adjustLine(pick._id, 0.5)}
                            className="size-4 rounded bg-[#1E293B] flex items-center justify-center hover:bg-[#00FF88]/20 text-muted-foreground hover:text-[#00FF88]"
                          >
                            <Plus className="size-2.5" />
                          </button>
                          {adj !== 0 && (
                            <span className="text-[9px] text-[#FFB800]">({adj > 0 ? "+" : ""}{adj} from {pick.line})</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-mono font-bold ${adjustedEdge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}>
                          {adjustedEdge > 0 ? "+" : ""}{adjustedEdge}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">{pick.platform}</div>
                        {adj !== 0 && (
                          <div className="text-[9px] text-[#FFB800]">adj. EV</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePick(pick._id)}
                        className="size-7 p-0 text-muted-foreground hover:text-[#FF4466] hover:bg-[#FF4466]/10"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* R4: Export row */}
            {myPicks && myPicks.length >= 2 && (
              <div className="p-3 border-t border-[#1E293B] bg-[#0A0E17]/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground mr-1">Export:</span>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyForPlatform("PrizePicks")} className="text-[10px] h-6 px-2 text-[#00FF88] hover:bg-[#00FF88]/10">
                    <ClipboardCopy className="size-2.5 mr-1" /> PrizePicks
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyForPlatform("Underdog")} className="text-[10px] h-6 px-2 text-[#00D4FF] hover:bg-[#00D4FF]/10">
                    <ClipboardCopy className="size-2.5 mr-1" /> Underdog
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyForPlatform("Kalshi")} className="text-[10px] h-6 px-2 text-[#A855F7] hover:bg-[#A855F7]/10">
                    <ClipboardCopy className="size-2.5 mr-1" /> Kalshi
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSaveAsImage} className="text-[10px] h-6 px-2 text-[#FFB800] hover:bg-[#FFB800]/10">
                    <Camera className="size-2.5 mr-1" /> Share Card
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Correlation Analysis */}
          {correlations && (correlations.warnings?.length > 0 || correlations.suggestions?.length > 0) && (
            <div className="space-y-3">
              {correlations.warnings?.length > 0 && (
                <div className="bg-[#FF4466]/5 border border-[#FF4466]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-4 text-[#FF4466]" />
                    <span className="text-sm font-semibold text-[#FF4466]">Correlation Warnings</span>
                  </div>
                  {correlations.warnings.map((w: string, i: number) => (
                    <p key={i} className="text-xs text-[#FF4466]/80 mb-1">{w}</p>
                  ))}
                </div>
              )}
              {correlations.suggestions?.length > 0 && (
                <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="size-4 text-[#00D4FF]" />
                    <span className="text-sm font-semibold text-[#00D4FF]">Optimizer Suggestions</span>
                  </div>
                  {correlations.suggestions.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-[#00D4FF]/80 mb-1">{s}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* R4: Auto-Suggest Diversification */}
          {suggestions && suggestions.length > 0 && myPicks && myPicks.length >= 1 && (
            <div className="bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-4 text-[#00FF88]" />
                <span className="text-sm font-semibold text-[#00FF88]">Suggested Picks to Diversify</span>
                <span className="text-[10px] text-muted-foreground">AI-selected to improve balance</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {suggestions.slice(0, 4).map((p: any) => (
                  <div key={p._id} className="flex items-center justify-between p-2 rounded-lg bg-[#111827] border border-[#1E293B]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge className={`text-[10px] font-bold shrink-0 ${
                        p.overUnder === "over" ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20" : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                      }`}>
                        {p.overUnder?.toUpperCase()}
                      </Badge>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-muted-foreground">{p.statType} · {p.line} · {p.sport}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-mono font-bold ${p.edge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}>
                        {p.edge > 0 ? "+" : ""}{p.edge}%
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => handleAddFromPack(p._id)} className="size-6 p-0 hover:bg-[#00FF88]/10 hover:text-[#00FF88]">
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Entry Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 sticky top-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-[#A855F7]" />
              Entry Summary
            </h3>

            {/* Diversification Score */}
            {myPicks && myPicks.length >= 2 && (
              <div className="mb-4 p-3 rounded-lg bg-[#0A0E17] border border-[#1E293B]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="size-3" /> Diversification
                  </span>
                  <span className="text-xs font-bold" style={{ color: divColor }}>{divLabel}</span>
                </div>
                <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${divScore}%`, backgroundColor: divColor }} />
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs font-mono" style={{ color: divColor }}>{divScore}/100</span>
                </div>
              </div>
            )}

            {/* Stake */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-muted-foreground">Stake</label>
              <div className="flex items-center gap-2">
                {[5, 10, 25, 50, 100].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStake(s)}
                    className={`text-xs py-1.5 px-2.5 rounded-lg border transition-all ${
                      stake === s
                        ? "bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#00D4FF]"
                        : "bg-[#0A0E17] border-[#1E293B] text-muted-foreground hover:text-white"
                    }`}
                  >
                    ${s}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-5 py-4 border-t border-[#1E293B]">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Picks</span>
                <span className="text-white font-mono">{myPicks?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Edge</span>
                <span className={`font-mono font-bold ${totalEdge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}>
                  {totalEdge > 0 ? "+" : ""}{totalEdge}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sports</span>
                <span className="text-white font-mono">{myPicks ? [...new Set(myPicks.map((p: any) => p.sport))].length : 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Over / Under</span>
                <span className="text-white font-mono">
                  {myPicks?.filter((p: any) => p.overUnder === "over").length || 0} / {myPicks?.filter((p: any) => p.overUnder === "under").length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform</span>
                <span className="text-[#A855F7] text-xs">{selectedPlatform}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entry Type</span>
                <span className="text-white capitalize">{entryType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stake</span>
                <span className="text-white font-mono">${stake}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmitEntry}
              disabled={!myPicks || myPicks.length < 2}
              className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E17] font-bold"
            >
              Submit {selectedPlatform} Entry
              <ArrowRight className="size-4 ml-1" />
            </Button>

            {myPicks && myPicks.length < 2 && myPicks.length > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">Need at least 2 picks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
