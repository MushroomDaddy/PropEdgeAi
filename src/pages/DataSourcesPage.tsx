import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DemoBanner } from "../components/propedge";
import {
  Database, Wifi, WifiOff, Activity, CheckCircle2,
  XCircle, AlertTriangle, Server,
} from "lucide-react";

function HealthBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-emerald-400" : value >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono w-8 text-right">{value}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    inactive: "bg-gray-400/10 text-gray-400 border-gray-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
    demo: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  };
  const icons: Record<string, ReactNode> = {
    active: <CheckCircle2 className="size-3" />,
    inactive: <WifiOff className="size-3" />,
    error: <XCircle className="size-3" />,
    demo: <AlertTriangle className="size-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.inactive}`}>
      {icons[status] || icons.inactive} {status.toUpperCase()}
    </span>
  );
}

export default function DataSourcesPage() {
  const data = useQuery(api.providerStatus.allProviders);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <DemoBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="size-6 text-[#00D4FF]" />
            Data Sources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Provider integrations, sync status, and data health
          </p>
        </div>
        {data && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
            <Wifi className="size-4 text-emerald-400" />
            <span className="text-xs font-bold">Mode: {data.mode?.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* DB Stats */}
      {data && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Props", value: data.dbStats.props },
            { label: "Players", value: data.dbStats.players },
            { label: "Games", value: data.dbStats.games },
            { label: "Results", value: data.dbStats.results },
            { label: "Kalshi", value: data.dbStats.kalshiMarkets },
            { label: "Imports", value: data.dbStats.importJobs },
          ].map((s) => (
            <div key={s.label} className="bg-[#0D1117] rounded-xl border border-white/5 p-3 text-center">
              <div className="text-lg font-bold font-mono">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Provider Cards */}
      <div className="space-y-3">
        {data?.providers?.map((p: any) => (
          <div
            key={p.provider}
            className="bg-[#0D1117] rounded-xl border border-white/5 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg flex items-center justify-center ${
                  p.status === "active" ? "bg-emerald-400/10" : "bg-white/5"
                }`}>
                  <Server className={`size-5 ${p.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <div className="font-bold text-sm">{p.displayName}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    {p.isLive ? (
                      <span className="flex items-center gap-1 text-emerald-400"><Activity className="size-3" /> Live</span>
                    ) : p.isDemoMode ? (
                      <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="size-3" /> Demo</span>
                    ) : (
                      <span className="flex items-center gap-1"><WifiOff className="size-3" /> Not Connected</span>
                    )}
                    {p.requiresApiKey && !p.apiKeyConfigured && (
                      <span className="text-red-400">• Needs API Key</span>
                    )}
                  </div>
                </div>
              </div>
              <StatusBadge status={p.isDemoMode ? "demo" : p.status} />
            </div>

            <HealthBar value={p.providerHealth} />

            <div className="flex flex-wrap gap-1.5">
              {p.supportedSports?.map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono">{s}</span>
              ))}
            </div>

            {p.lastSyncTime && (
              <div className="text-[10px] text-muted-foreground">
                Last sync: {new Date(p.lastSyncTime).toLocaleString()} • {p.recordsUpdated} records
              </div>
            )}
          </div>
        ))}
      </div>

      {!data && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#0D1117] rounded-xl border border-white/5 p-4 h-28 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
