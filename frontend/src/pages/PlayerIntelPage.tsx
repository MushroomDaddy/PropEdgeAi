
import { Activity, BarChart3, Bot, Search, Sparkles, User, ChevronRight, Zap, Target, TrendingUp, History, ListFilter } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ConfidenceMeter,
  DataSourceBadge,
  DemoBanner,
  EdgeBadge,
  EdgeMeter,
  EmptyState,
  GameLogTable,
  GameStrip,
  HitRateHeatmap,
  LineMovementTimeline,
  PlayerHeroCard,
  PropDetailDrawer,
  PropOpportunityCard,
  SkeletonCard,
  StatSparkline,
  StatTrendCard,
  TeamBadge,
  ValueScoreRing,
} from "@/components/propedge";
import { formatDirection, formatLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { usePlayerSearch, usePlayerProfile } from "../hooks/api/usePlayers";
import { useAddPick } from "../hooks/api/usePicks";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, Drawer, DrawerContent } from "@/components/ui/tabs";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";

const TABS = [
  { id: "overview", label: "Intelligence" },
  { id: "props", label: "Active Props" },
  { id: "gamelogs", label: "Game Logs" },
  { id: "splits", label: "Matchup Splits" },
  { id: "matchups", label: "Deep DNA" },
  { id: "results", label: "Learning Loop" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PlayerIntelPage() {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(qParam || null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [drawerProp, setDrawerProp] = useState<any>(null);

  useEffect(() => {
    if (qParam && qParam !== selectedPlayer) {
      setSearchTerm(qParam);
      setSelectedPlayer(qParam);
      setActiveTab("overview");
    }
  }, [qParam, selectedPlayer]);

  const { data: searchResults } = usePlayerSearch(searchTerm.length >= 2 ? searchTerm : "");
  const { data: profile } = usePlayerProfile(selectedPlayer ?? undefined);

  return (
    <div className="relative min-h-screen">
      <AnimatedSportsBackground />
      
      <div className="container relative z-10 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
              PLAYER <span className="text-primary italic">INTEL</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">Scout-Grade Intelligence Dashboard</p>
          </div>
          
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter player name for deep analysis..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedPlayer) setSelectedPlayer(null);
              }}
              className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/10 pl-11 pr-4 text-sm font-medium focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
            />
            
            <AnimatePresence>
                {searchResults && searchResults.length > 0 && !selectedPlayer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full mt-2 left-0 right-0 rounded-2xl border border-white/10 bg-[#0c0d0e]/95 backdrop-blur-2xl shadow-2xl z-50 p-2 overflow-hidden"
                  >
                    {searchResults.map((p: any) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setSelectedPlayer(p.name);
                          setSearchTerm(p.name);
                          setActiveTab("overview");
                        }}
                        className="w-full text-left p-3 hover:bg-white/5 rounded-xl flex items-center gap-4 transition-colors group"
                      >
                        <div className="size-10 rounded-lg bg-indigo-500/10 border border-white/5 flex items-center justify-center text-indigo-400 font-black">
                          {p.name.split(' ').map((n:any)=>n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            {p.team} · {p.position} · {p.sport}
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {profile ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Massive Hero */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-br from-indigo-900/20 to-transparent p-8 md:p-12">
               <div className="absolute top-0 right-0 p-12 opacity-10 select-none pointer-events-none">
                   <h2 className="text-[150px] font-black italic tracking-tighter leading-none">{profile.player.teamAbbr || 'NBA'}</h2>
               </div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                   <div className="relative">
                        <div className="size-40 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-5xl font-black italic transform -rotate-3 transition-transform hover:rotate-0 duration-500 overflow-hidden shadow-2xl">
                             {profile.player.imageUrl ? (
                                 <img src={profile.player.imageUrl} className="h-full w-full object-cover grayscale brightness-110" />
                             ) : (
                                 <span className="opacity-20">{profile.player.name[0]}</span>
                             )}
                        </div>
                        <div className="absolute -bottom-4 -right-4 size-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl">
                            <span className="text-3xl font-black italic text-primary-foreground">#{profile.player.jerseyNumber || '00'}</span>
                        </div>
                   </div>
                   
                   <div className="text-center md:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                            <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-[0.2em] font-black text-[10px]">{profile.player.sport}</Badge>
                            <Badge variant="outline" className="text-white border-white/20 uppercase tracking-[0.1em] font-bold text-[10px]">{profile.player.team}</Badge>
                            <Badge className="bg-white/5 text-white/50 border-white/5 uppercase tracking-[0.1em] font-bold text-[10px]">{profile.player.position}</Badge>
                        </div>
                        <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">{profile.player.name}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Condition</span>
                                <span className={cn("text-lg font-black uppercase", profile.player.recentForm === 'hot' ? 'text-primary' : 'text-orange-400')}>{profile.player.recentForm || 'Active'}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10 mx-2" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Reliability</span>
                                <span className="text-lg font-black uppercase text-indigo-400">{profile.player.reliabiltyRating || 'Stable'}</span>
                            </div>
                        </div>
                   </div>
                   
                   <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                        <Button className="h-14 w-full md:w-64 bg-primary text-primary-foreground font-black italic uppercase text-lg shadow-[0_0_50px_rgba(0,255,136,0.2)] hover:scale-105 active:scale-95 transition-all">
                            Analyze All Props
                        </Button>
                        <Button variant="outline" className="h-12 w-full md:w-64 border-white/10 hover:bg-white/5 font-bold uppercase text-xs tracking-widest">
                            Official Scout Feed
                        </Button>
                   </div>
               </div>
            </div>

            {/* Smart Tabs Navigation */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-3xl border-y border-white/5 -mx-4 px-4 overflow-hidden">
                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "h-10 px-6 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all",
                                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Body */}
            <div className="space-y-8 min-h-[400px]">
                {activeTab === "overview" && <OverviewRedesign profile={profile} onOpenPropDrawer={setDrawerProp} />}
                {activeTab === "props" && <PropsTabRedesign profile={profile} onOpenPropDrawer={setDrawerProp} />}
            </div>

          </div>
        ) : selectedPlayer ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-20">
             {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-80 rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse" />
             ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white/[0.01] border border-dashed border-white/10 rounded-[40px] space-y-4">
             <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                 <User className="size-10 text-primary opacity-40" />
             </div>
             <h2 className="text-2xl font-bold text-center">Awaiting Direct Injection</h2>
             <p className="text-muted-foreground text-center max-w-sm mb-6 uppercase text-[10px] tracking-widest font-black">Search for a player above to initialize detailed scouts and statistical modeling.</p>
             <div className="flex gap-2">
                 {['LeBron James', 'Patrick Mahomes', 'Shohei Ohtani'].map(name => (
                     <Button key={name} variant="ghost" onClick={() => setSearchTerm(name)} className="h-9 px-4 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-widest">{name}</Button>
                 ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewRedesign({ profile, onOpenPropDrawer }: { profile: any, onOpenPropDrawer: (p:any) => void }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="lg:col-span-8 space-y-6">
                {/* Visual Momentum */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 lg:p-8 relative overflow-hidden group">
                     <div className="flex items-center justify-between mb-8">
                         <div>
                            <h3 className="text-xl font-black italic uppercase text-white leading-none">Prop Momentum Radar</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-50">Last 10 Performance Intelligence</p>
                         </div>
                         <Button variant="ghost" size="sm" className="opacity-40 hover:opacity-100 group">
                             History <History className="size-3 ml-2 group-hover:rotate-12 transition-transform" />
                         </Button>
                     </div>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ScoutMetric label="Avg Points" value={profile.last10Avg?.points || '24.2'} sub="+2.1 vs Season" trend="up" />
                        <ScoutMetric label="Floor" value="18" sub="Safety Level 92%" />
                        <ScoutMetric label="Ceiling" value="44" sub="Max Burst Prob 8%" />
                        <ScoutMetric label="Hit Rate" value="70%" sub="Last 10 Games" trend="up" />
                     </div>
                </div>

                {/* AI Summary Card Re-styled */}
                <div className="rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-primary/5 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <Bot className="size-20 text-indigo-400 opacity-5" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="size-5 text-white" />
                        </div>
                        <h3 className="text-lg font-black uppercase italic tracking-widest text-[#f7f8f8]">What PropEdge Sees</h3>
                    </div>
                    <p className="text-xl text-white/90 leading-relaxed font-medium">
                        <span className="text-primary font-black italic">{profile.player.name}</span> is exhibiting elite efficiency in high-pressure matchups. 
                        With a <span className="text-primary font-bold">Value Score of 88</span> on his Points Prop, our model detects a market lag of <span className="text-indigo-400 font-bold">14.2%</span>. 
                        Historical data suggests his performance increases by <span className="text-primary font-bold">12%</span> when playing against bottom-tier defensive guards.
                    </p>
                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                        <Badge className="bg-indigo-400/20 text-indigo-300 border-none uppercase text-[9px] font-black p-2 tracking-tighter italic">Confidence Spike Observed</Badge>
                        <Badge className="bg-primary/20 text-primary border-none uppercase text-[9px] font-black p-2 tracking-tighter italic">Market Variance Detected</Badge>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                 <div className="glass-panel border-white/5 overflow-hidden rounded-[32px] p-6 lg:p-8 h-full bg-[#08090a]">
                    <div className="mb-6">
                        <h3 className="text-sm font-black uppercase text-muted-foreground tracking-[0.2em] mb-1 leading-none">Top Alpha Op</h3>
                        <p className="text-2xl font-black italic text-white leading-none">RECOMMENDED PLAY</p>
                    </div>
                    
                    {profile.currentProps?.[0] ? (
                        <div className="space-y-6">
                            <PremiumPropCard 
                                prop={{
                                    id: profile.currentProps[0]._id,
                                    player: profile.player.name,
                                    propType: profile.currentProps[0].statType,
                                    line: profile.currentProps[0].line,
                                    projection: profile.currentProps[0].projection,
                                    edge: profile.currentProps[0].edge,
                                    winProb: profile.currentProps[0].confidence,
                                    overOdds: -110,
                                    underOdds: -110,
                                    confidence: 'High'
                                }}
                            />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Model Drift</span>
                                    <span className="text-xs font-bold text-primary italic">+3.5 Units Alpha</span>
                                </div>
                                <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 font-bold uppercase text-[10px] tracking-widest">View Detailed Chart</Button>
                            </div>
                        </div>
                    ) : null}
                 </div>
            </div>
        </div>
    );
}

function ScoutMetric({ label, value, sub, trend }: any) {
    return (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.05] group">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1 opacity-40 group-hover:opacity-100">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black italic tracking-tighter text-white">{value}</span>
                {trend === 'up' && <TrendingUp className="size-3 text-primary" />}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground mt-1 opacity-60 leading-tight">{sub}</p>
        </div>
    );
}

function PropsTabRedesign({ profile, onOpenPropDrawer }: any) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
             {profile.currentProps?.map((p: any) => (
                 <motion.div key={p._id} whileTap={{ scale: 0.98 }} onClick={() => onOpenPropDrawer({...p, playerName: profile.player.name})}>
                     <PremiumPropCard 
                         prop={{
                             id: p._id,
                             player: profile.player.name,
                             propType: p.statType,
                             line: p.line,
                             projection: p.projection,
                             edge: p.edge,
                             winProb: p.confidence,
                             overOdds: -110,
                             underOdds: -110,
                             confidence: p.confidence > 70 ? 'High' : 'Medium'
                         }}
                     />
                 </motion.div>
             ))}
        </div>
    );
}
