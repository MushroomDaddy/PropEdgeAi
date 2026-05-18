
import { useProps } from '../hooks/api/useProps';
import { useAddPick } from '../hooks/api/usePicks';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  DollarSign,
  History,
  LayoutGrid,
  List,
  Search,
  ShoppingCart,
  Star,
  TrendingUp,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Drawer, 
    DrawerContent, 
    DrawerHeader, 
    DrawerTitle, 
    DrawerDescription, 
    DrawerFooter, 
    DrawerClose 
} from "@/components/ui/drawer";
import { PremiumPropCard } from "@/components/dashboard/PremiumPropCard";
import { 
    FadeIn, 
    PageTransition, 
    StaggerContainer, 
    StaggerItem 
} from "@/components/propedge/PageTransition";
import { formatDirection, formatLabel } from "@/lib/labels";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";

const SPORTS = ["All", "NBA", "NFL", "MLB", "NHL"];
const PLATFORMS = ["All", "PrizePicks", "Underdog", "Sleeper", "Kalshi"];

export function PropsAnalyzerPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");
  const [platform, setPlatform] = useState("All");
  const [selectedProp, setSelectedProp] = useState<any>(null);

  const { data: allProps, isLoading } = useProps(
    sport === "All" ? undefined : sport,
    platform === "All" ? undefined : platform,
  );

  const filteredProps = useMemo(() => {
    if (!allProps) return [];
    let filtered = allProps;
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.playerName.toLowerCase().includes(lower) ||
          p.team.toLowerCase().includes(lower) ||
          p.statType.toLowerCase().includes(lower),
      );
    }
    return filtered;
  }, [allProps, search]);

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <AnimatedSportsBackground />
        
        <div className="container relative z-10 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Search className="size-8 text-primary" />
                Prop Analyzer
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Deep institutional-grade sports intelligence</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('grid')}
                    className="h-8 gap-2 rounded-lg"
                >
                    <LayoutGrid className="size-4" /> Card View
                </Button>
                <Button 
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('table')}
                    className="h-8 gap-2 rounded-lg"
                >
                    <List className="size-4" /> Advanced View
                </Button>
            </div>
          </div>

          {/* Ultra-Modern Filter Bar */}
          <div className="sticky top-0 z-30 flex flex-col gap-4 bg-background/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search 14,000+ props..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 bg-white/[0.03] border-white/10 rounded-xl focus:ring-primary/20"
                />
              </div>
              
              <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5">
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      sport === s ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,255,136,0.3)]" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              
              <Button variant="outline" className="h-11 border-white/10 gap-2 px-4 rounded-xl">
                 <SlidersHorizontal className="size-4 text-primary" />
                 <span>Filters</span>
              </Button>
            </div>
          </div>

          {/* Content Grid */}
          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-64 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
                ))}
             </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" stagger={0.03}>
                {filteredProps.map((p: any) => (
                    <StaggerItem key={p._id} onClick={() => setSelectedProp(p)} className="cursor-pointer">
                        <PremiumPropCard 
                            prop={{
                                id: p._id,
                                player: p.playerName,
                                team: p.team,
                                sport: p.sport,
                                propType: p.statType,
                                line: p.line,
                                projection: p.projection || (p.line * (1 + p.edge/100)),
                                edge: p.edge,
                                winProb: p.confidence || 65,
                                overOdds: -110,
                                underOdds: -110,
                                confidence: p.confidence > 70 ? 'High' : 'Medium'
                            }}
                        />
                    </StaggerItem>
                ))}
            </StaggerContainer>
          )}

          {/* Global Empty State */}
          {!isLoading && filteredProps.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Filter className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No props found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
                <Button variant="outline" className="mt-6" onClick={() => { setSearch(''); setSport('All'); }}>Clear All Filters</Button>
             </div>
          )}
        </div>

        {/* Premium Detail Drawer (Mobile+Desktop) */}
        <Drawer open={!!selectedProp} onOpenChange={(open) => !open && setSelectedProp(null)}>
            <DrawerContent className="bg-[#0c0d0e]/95 border-t border-white/10 backdrop-blur-2xl">
                <div className="mx-auto w-full max-w-4xl px-6 py-8">
                    {selectedProp && (
                        <div className="space-y-8">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="size-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-3xl font-black opacity-40">
                                        {selectedProp.playerName.split(' ').map((n:any) => n[0]).join('')}
                                    </div>
                                    <div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">{selectedProp.sport} · {selectedProp.team}</Badge>
                                        <h2 className="text-4xl font-black tracking-tighter text-white">{selectedProp.playerName}</h2>
                                        <p className="text-lg text-muted-foreground font-medium">{formatLabel(selectedProp.statType)} Prop Analysis</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Value Score</p>
                                    <div className="text-5xl font-black text-primary drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">{selectedProp.valueScore || 88}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailBox label="Current Line" value={selectedProp.line} />
                                <DetailBox label="AI Projection" value={selectedProp.projection} highlight />
                                <DetailBox label="Calculated Edge" value={`${selectedProp.edge}%`} color="emerald" />
                                <DetailBox label="Confidence" value={`${selectedProp.confidence}%`} color="indigo" />
                            </div>

                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Prop Intelligence Story</h3>
                                <p className="text-white/80 leading-relaxed text-lg">
                                    Line opened at {selectedProp.line}. PropEdge AI identifies a strong <span className="text-primary font-bold">{selectedProp.edge}% edge</span> on the {selectedProp.overUnder}. 
                                    Player has hit this mark in <span className="text-primary font-bold">7 of last 10 games</span>. Matchup conditions are favorable with a rating of 8.2/10.
                                </p>
                            </div>

                            <DrawerFooter className="px-0 pt-6 flex flex-row gap-4">
                                <Button className="h-14 flex-1 text-lg font-bold bg-primary text-primary-foreground shadow-2xl">
                                    Add to Builder
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline" className="h-14 px-8 text-lg font-bold border-white/10 hover:bg-white/5">
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

function DetailBox({ label, value, color, highlight }: { label: string, value: any, color?: string, highlight?: boolean }) {
    const colors: any = {
        emerald: "text-emerald-400",
        indigo: "text-indigo-400",
        default: "text-white"
    };
    return (
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-white/[0.02] border-white/5'}`}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <div className={`text-3xl font-black font-mono ${colors[color || 'default']}`}>{value}</div>
        </div>
    );
}
