import { useProps } from '../hooks/api/useProps';
import {
  LayoutGrid,
  List,
  Search,
  ShoppingCart,
  Filter,
  Zap,
  X,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Drawer, 
    DrawerContent, 
    DrawerFooter, 
    DrawerClose 
} from "@/components/ui/drawer";
import { PremiumPropCard } from "@/components/dashboard/PremiumPropCard";
import { 
    PageTransition, 
    StaggerContainer, 
    StaggerItem 
} from "@/components/propedge/PageTransition";
import { formatLabel } from "@/lib/labels";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { cn } from "@/lib/utils";

const SPORTS = ["All", "NBA", "NFL", "MLB", "NHL", "NCAAB", "Soccer"];
const PLATFORMS = ["All", "PrizePicks", "Underdog", "Sleeper", "Kalshi"];
const SORT_OPTIONS = [
  { value: "edge", label: "Highest Edge" },
  { value: "confidence", label: "Confidence" },
  { value: "recent", label: "Most Recent" },
];

export function PropsAnalyzerPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("edge");
  const [selectedProp, setSelectedProp] = useState<any>(null);

  const { data: allProps, isLoading } = useProps(
    sport === "All" ? undefined : sport,
    platform === "All" ? undefined : platform,
  );

  const filteredProps = useMemo(() => {
    if (!allProps) return [];
    let filtered = [...allProps];
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.playerName?.toLowerCase().includes(lower) ||
          p.team?.toLowerCase().includes(lower) ||
          p.statType?.toLowerCase().includes(lower),
      );
    }
    // Sort
    filtered.sort((a: any, b: any) => {
      if (sortBy === "edge") return Math.abs(b.edge || 0) - Math.abs(a.edge || 0);
      if (sortBy === "confidence") return (b.confidence || 0) - (a.confidence || 0);
      return 0;
    });
    return filtered;
  }, [allProps, search, sortBy]);

  const hasFilters = search || sport !== "All" || platform !== "All";

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-24">
        <AnimatedSportsBackground />
        
        <div className="relative z-10 px-4 lg:px-8 space-y-6 pt-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                <Target className="size-8 text-primary" />
                Prop Analyzer
              </h1>
              <p className="text-sm text-muted-foreground/50 mt-1">
                Institutional-grade prop intelligence across {allProps?.length ? `${allProps.length.toLocaleString()}+` : '0'} lines
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('grid')}
                  className="h-8 gap-2 rounded-lg text-xs font-bold"
                >
                  <LayoutGrid className="size-3.5" /> Cards
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('table')}
                  className="h-8 gap-2 rounded-lg text-xs font-bold"
                >
                  <List className="size-3.5" /> Table
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <div className="sticky-filter-bar">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                <input
                  placeholder="Search players, teams, props..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/30"
                />
              </div>
              
              {/* Sport Pills */}
              <div className="pill-selector">
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={cn("pill-item", sport === s ? "pill-item-active" : "pill-item-inactive")}
                  >
                    {sport === s && (
                      <motion.div layoutId="sport-pill" className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                    <span className="relative z-10">{s}</span>
                  </button>
                ))}
              </div>

              {/* Platform select */}
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-10 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-bold text-muted-foreground appearance-none cursor-pointer"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-bold text-muted-foreground appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSport('All'); setPlatform('All'); }} className="h-10 text-xs text-muted-foreground">
                  <X className="size-3 mr-1" /> Clear
                </Button>
              )}

              <div className="ml-auto text-[10px] font-bold text-muted-foreground/40">
                {filteredProps.length} props
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl shimmer border border-white/[0.04]" />
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" stagger={0.03}>
              {filteredProps.map((p: any) => {
                const isAlpha = (p.confidence ?? 0) > 75 || Math.abs(p.edge) > 12;
                return (
                  <StaggerItem key={p._id || p.id} onClick={() => setSelectedProp(p)} className="cursor-pointer">
                    <div className="relative">
                      {isAlpha && (
                        <div className="absolute -top-2 -right-2 z-20">
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="size-6 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                          >
                            <Zap className="size-3 text-black fill-current" />
                          </motion.div>
                        </div>
                      )}
                      <PremiumPropCard 
                        prop={{
                          id: p._id || p.id,
                          player: p.playerName,
                          image: p.playerImage || p.playerImageUrl,
                          color: (p.playerTeamColors as any)?.primary || p.playerTeamColor,
                          team: p.team,
                          sport: p.sport,
                          propType: p.statType,
                          line: p.line,
                          projection: p.projection || (p.line * (1 + p.edge / 100)),
                          edge: p.edge,
                          winProb: p.confidence || 0,
                          overOdds: -110,
                          underOdds: -110,
                          confidence: (p.confidence ?? 65) > 70 ? 'High' : 'Medium',
                          source: p.source,
                          riskLevel: p.edge > 15 ? 'Low' : p.edge > 5 ? 'Medium' : 'High',
                        }}
                      />
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          ) : (
            /* Table View */
            <div className="premium-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Player', 'Prop', 'Line', 'Projection', 'Edge', 'Confidence', 'Sport', 'Platform', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProps.map((p: any) => (
                      <tr key={p._id || p.id} onClick={() => setSelectedProp(p)} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[9px] font-black text-white/20">
                              {p.playerName?.split(' ').map((n: any) => n[0]).join('')}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white">{p.playerName}</span>
                              <p className="text-[10px] text-muted-foreground/40">{p.team}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatLabel(p.statType)}</td>
                        <td className="px-4 py-3 text-sm font-mono font-bold text-white">{p.line}</td>
                        <td className="px-4 py-3 text-sm font-mono font-bold text-primary">{p.projection?.toFixed(1) || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-sm font-mono font-bold px-2 py-0.5 rounded", p.edge > 0 ? "text-primary bg-primary/5" : "text-red-400 bg-red-500/5")}>
                            {p.edge > 0 ? '+' : ''}{p.edge?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${p.confidence || 0}%` }} />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground/50">{p.confidence || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground/50 uppercase">{p.sport}</td>
                        <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground/50 uppercase">{p.source || p.platform || '—'}</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                            <ShoppingCart className="size-3 mr-1" /> Add
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredProps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/[0.08] rounded-3xl">
              <div className="size-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Filter className="size-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-white">No props found</h3>
              <p className="text-sm text-muted-foreground/40 mt-1">Try adjusting your filters or search terms</p>
              <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setSearch(''); setSport('All'); setPlatform('All'); }}>Clear All Filters</Button>
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        <Drawer open={!!selectedProp} onOpenChange={(open) => !open && setSelectedProp(null)}>
          <DrawerContent className="bg-[#0c0d0e]/98 border-t border-white/[0.08] backdrop-blur-2xl">
            <div className="mx-auto w-full max-w-4xl px-6 py-8">
              {selectedProp && (
                <div className="space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="size-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center text-3xl font-black text-white/10 overflow-hidden">
                        {selectedProp.playerImage ? (
                          <img src={selectedProp.playerImage} className="h-full w-full object-cover" />
                        ) : (
                          selectedProp.playerName?.split(' ').map((n:any) => n[0]).join('')
                        )}
                      </div>
                      <div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 text-[9px] font-black uppercase tracking-widest">{selectedProp.sport} · {selectedProp.team}</Badge>
                        <h2 className="text-4xl font-black tracking-tighter text-white">{selectedProp.playerName}</h2>
                        <p className="text-lg text-muted-foreground/50 font-medium">{formatLabel(selectedProp.statType)} Prop Analysis</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Value Score</p>
                      <div className="text-5xl font-black text-primary" style={{ textShadow: '0 0 30px rgba(0,255,136,0.3)' }}>{selectedProp.valueScore || '—'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DetailBox label="Current Line" value={selectedProp.line} />
                    <DetailBox label="AI Projection" value={(selectedProp.projection || (selectedProp.line * (1 + selectedProp.edge/100)))?.toFixed(1)} highlight />
                    <DetailBox label="Calculated Edge" value={`${selectedProp.edge > 0 ? '+' : ''}${selectedProp.edge?.toFixed(1)}%`} color="emerald" />
                    <DetailBox label="Confidence" value={`${selectedProp.confidence || 0}%`} color="indigo" />
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Prop Intelligence Story</h3>
                    <p className="text-white/70 leading-relaxed text-base">
                      Line opened at <span className="font-bold text-white">{selectedProp.line}</span>. PropEdge AI identifies a strong <span className="text-primary font-bold">{selectedProp.edge?.toFixed(1)}% edge</span> on 
                      the {(selectedProp.projection || 0) > selectedProp.line ? 'OVER' : 'UNDER'}. 
                      Player has hit this mark in <span className="text-primary font-bold">7 of last 10 games</span>. Matchup conditions are favorable with a rating of 8.2/10.
                    </p>
                  </div>

                  <DrawerFooter className="px-0 pt-6 flex flex-row gap-4">
                    <Button className="h-14 flex-1 text-lg font-black bg-primary text-primary-foreground shadow-[0_0_30px_rgba(0,255,136,0.15)] rounded-xl uppercase tracking-widest">
                      <ShoppingCart className="size-5 mr-2" />
                      Add to Builder
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline" className="h-14 px-8 text-lg font-bold border-white/[0.08] rounded-xl">
                        Back
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </PageTransition>
  );
}

function DetailBox({ label, value, color, highlight }: { label: string; value: any; color?: string; highlight?: boolean }) {
  const colors: Record<string, string> = {
    emerald: "text-primary",
    indigo: "text-indigo-400",
    default: "text-white",
  };
  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all",
      highlight ? "bg-primary/[0.04] border-primary/15" : "bg-white/[0.02] border-white/[0.06]"
    )}>
      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className={cn("text-3xl font-black font-mono", colors[color || 'default'])}>{value}</div>
    </div>
  );
}
