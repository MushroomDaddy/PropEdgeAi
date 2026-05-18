import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Globe,
  Radio,
  RefreshCw,
  Server,
  Shield,
  WifiOff,
  XCircle,
  Zap,
  Gauge,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProviderStatus, useAdminSync } from "../hooks/api/useProviders";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/propedge/PageTransition";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "../lib/api";

/* Default providers if API not loaded */
const DEFAULT_PROVIDERS = [
  { id: "odds-api", name: "The Odds API", description: "Real-time odds from 40+ sportsbooks", status: "active", health: 98, lastSync: "2m ago", dataPoints: "14.2k", sport: "All Sports", icon: "🎰", color: "#00d4ff", category: "Odds" },
  { id: "api-sports", name: "API-SPORTS", description: "Live scores, fixtures, standings", status: "active", health: 95, lastSync: "5m ago", dataPoints: "8.4k", sport: "All Sports", icon: "⚡", color: "#a855f7", category: "Scores" },
  { id: "sportsdb", name: "TheSportsDB", description: "Player profiles, images, team data", status: "active", health: 92, lastSync: "15m ago", dataPoints: "22k", sport: "All Sports", icon: "🗄️", color: "#ff6b35", category: "Metadata" },
  { id: "balldontlie", name: "BallDontLie", description: "NBA stats, game logs, player data", status: "active", health: 88, lastSync: "10m ago", dataPoints: "45k", sport: "NBA", icon: "🏀", color: "#00ff88", category: "Stats" },
  { id: "serpapi", name: "SerpApi", description: "News, injury reports, public sentiment", status: "demo", health: 0, lastSync: "Never", dataPoints: "0", sport: "All Sports", icon: "🔍", color: "#ffb800", category: "News" },
];

export function DataSourcesPage() {
  const { data: apiProviders } = useProviderStatus();
  void useAdminSync();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [globalSyncing, setGlobalSyncing] = useState(false);

  const providers = (apiProviders as any[])?.length > 0 
    ? (apiProviders as any[]).map((p: any, i: number) => ({ ...DEFAULT_PROVIDERS[i % DEFAULT_PROVIDERS.length], ...p }))
    : DEFAULT_PROVIDERS;

  const activeCount = providers.filter(p => p.status === 'active' || p.status === 'live').length;
  const avgHealth = Math.round(providers.reduce((acc, p) => acc + (p.health || 0), 0) / providers.length);
  const totalDataPoints = providers.reduce((acc, p) => {
    const num = parseFloat(String(p.dataPoints).replace(/[^\d.]/g, ''));
    const mult = String(p.dataPoints).includes('k') ? 1000 : 1;
    return acc + (num * mult || 0);
  }, 0);

  const handleSync = async (providerId: string) => {
    setSyncing(providerId);
    try {
      toast.info(`Syncing ${providerId}...`);
      await api.post('/api/sync/trigger', { provider: providerId });
      toast.success(`${providerId} synced successfully`);
    } catch (e: any) {
      toast.error(e.message);
    }
    setSyncing(null);
  };

  const handleGlobalSync = async () => {
    setGlobalSyncing(true);
    try {
      toast.info('Initializing System-Wide Sync...');
      const result = await api.post<any>('/api/sync/trigger', {});
      toast.success(`SYNC COMPLETE: ${result.message || 'All providers refreshed'}`);
      window.location.reload();
    } catch (e: any) {
      toast.error('Sync failed: ' + e.message);
    }
    setGlobalSyncing(false);
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-24">
        <AnimatedSportsBackground />

        <div className="relative z-10 px-4 lg:px-8 space-y-6 pt-6 max-w-[1600px] mx-auto">
          
          {/* ═══ Header ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0c0d0e] via-[#111214] to-[#0c0d0e] p-6 lg:p-8"
          >
            <div className="absolute inset-0 grid-bg-fine opacity-20" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/[0.04] rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/10 border border-cyan-500/20 flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(0,212,255,0.12)' }}>
                  <Database className="size-8 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-white">
                    Data Command Center
                  </h1>
                  <p className="text-sm text-muted-foreground/50 mt-1 flex items-center gap-2">
                    <Radio className="size-3 text-cyan-400 animate-pulse" />
                    Provider Health · Sync Management · Request Budget
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleGlobalSync}
                disabled={globalSyncing}
                className="h-12 bg-primary text-primary-foreground font-black uppercase text-[11px] tracking-widest px-6 shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] rounded-xl disabled:opacity-50"
              >
                {globalSyncing ? (
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="size-4 mr-2" />
                )}
                {globalSyncing ? 'Syncing...' : 'Sync All Sources'}
              </Button>
            </div>
          </motion.div>

          {/* ═══ Overview Cards ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <OverviewCard label="Active Sources" value={`${activeCount}/${providers.length}`} icon={<Server className="size-5" />} color="#00ff88" />
            <OverviewCard label="System Health" value={`${avgHealth}%`} icon={<Shield className="size-5" />} color={avgHealth >= 80 ? "#00ff88" : avgHealth >= 50 ? "#ffb800" : "#ff4466"} />
            <OverviewCard label="Data Points" value={totalDataPoints > 1000 ? `${(totalDataPoints / 1000).toFixed(1)}k` : totalDataPoints.toString()} icon={<BarChart3 className="size-5" />} color="#00d4ff" />
            <OverviewCard label="API Budget" value="78%" icon={<Gauge className="size-5" />} color="#a855f7" sub="Monthly allocation" />
          </div>

          {/* ═══ Request Budget Meter ═══ */}
          <FadeIn delay={0.2}>
            <div className="premium-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="size-4 text-purple-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Monthly API Request Budget</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground/50">78,000 / 100,000 requests</span>
              </div>
              <div className="h-3 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                  style={{ boxShadow: '0 0 15px rgba(0,255,136,0.3)' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                <span>Resets in 13 days</span>
                <span>22,000 remaining</span>
              </div>
            </div>
          </FadeIn>

          {/* ═══ Provider Cards Grid ═══ */}
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Globe className="size-5 text-cyan-400" />
              Connected Providers
            </h2>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.05}>
              {providers.map((provider: any) => (
                <StaggerItem key={provider.id || provider.name}>
                  <ProviderCard
                    provider={provider}
                    syncing={syncing === (provider.id || provider.name)}
                    onSync={() => handleSync(provider.id || provider.name)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

/* ═══ Provider Card ═══ */
function ProviderCard({ provider, syncing, onSync }: { provider: any; syncing: boolean; onSync: () => void }) {
  const isActive = provider.status === 'active' || provider.status === 'live';
  const healthColor = (provider.health ?? 0) >= 80 ? '#00ff88' : (provider.health ?? 0) >= 50 ? '#ffb800' : '#ff4466';
  const providerColor = provider.color || '#5e6ad2';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="premium-card rounded-2xl overflow-hidden"
    >
      {/* Color accent top */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${providerColor}, transparent)` }} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="size-12 rounded-xl flex items-center justify-center text-2xl border border-white/[0.06]"
              style={{ backgroundColor: `${providerColor}10` }}
            >
              {provider.icon || '🔌'}
            </div>
            <div>
              <h3 className="font-bold text-white text-[15px]">{provider.name}</h3>
              <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-wider">{provider.category || 'General'}</p>
            </div>
          </div>
          <StatusBadge status={provider.status} />
        </div>

        <p className="text-xs text-muted-foreground/50 leading-relaxed">{provider.description}</p>

        {/* Health Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
            <span className="text-muted-foreground/40">Health</span>
            <span style={{ color: healthColor }}>{provider.health || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${provider.health || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: healthColor, boxShadow: `0 0 8px ${healthColor}40` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.02] rounded-lg p-2 text-center">
            <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Data</p>
            <p className="text-sm font-black text-white font-mono">{provider.dataPoints || '0'}</p>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-2 text-center">
            <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Last Sync</p>
            <p className="text-sm font-bold text-muted-foreground/60">{provider.lastSync || 'Never'}</p>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-2 text-center">
            <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Sport</p>
            <p className="text-sm font-bold text-muted-foreground/60">{provider.sport || 'All'}</p>
          </div>
        </div>

        {/* Sync Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={syncing || !isActive}
          className="w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/[0.08] hover:bg-white/[0.04] disabled:opacity-40"
        >
          {syncing ? (
            <><RefreshCw className="size-3 mr-2 animate-spin" /> Syncing...</>
          ) : (
            <><RefreshCw className="size-3 mr-2" /> Sync Now</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

/* ═══ Status Badge ═══ */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; icon: ReactNode }> = {
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <CheckCircle2 className="size-3" /> },
    live: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: <Radio className="size-3" /> },
    demo: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <AlertTriangle className="size-3" /> },
    inactive: { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: <WifiOff className="size-3" /> },
    error: { bg: 'bg-red-500/10', text: 'text-red-400', icon: <XCircle className="size-3" /> },
  };
  const s = styles[status] || styles.inactive;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-transparent", s.bg, s.text)}>
      {s.icon} {status}
    </span>
  );
}

/* ═══ Overview Card ═══ */
function OverviewCard({ label, value, icon, color, sub }: { label: string; value: string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <FadeIn>
      <motion.div whileHover={{ y: -3 }} className="premium-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3" style={{ color }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>{icon}</div>
        </div>
        <p className="metric-label mb-1">{label}</p>
        <p className="text-2xl font-black tracking-tighter text-white font-mono">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground/40 mt-1">{sub}</p>}
      </motion.div>
    </FadeIn>
  );
}
