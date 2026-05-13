/**
 * ProviderStatusCard — R13 Premium Visual
 *
 * Rich card showing provider health, sync status, rate limits,
 * and data coverage at a glance.
 */

import { motion } from "framer-motion";
import {
  Server, Zap, WifiOff, AlertTriangle, Clock,
  BarChart3, Activity, CheckCircle2, XCircle, RefreshCw,
} from "lucide-react";

interface Props {
  provider: string;
  displayName: string;
  status: "active" | "inactive" | "error" | "syncing";
  isLive: boolean;
  apiKeyConfigured: boolean;
  supportedSports: string[];
  supportedMarkets: string[];
  requestsUsed?: number;
  requestLimit?: number;
  lastSync?: number;
  lastError?: string;
  recordCount?: number;
  dataTypes?: string[];
  onSync?: () => void;
}

const STATUS_CONFIG = {
  active: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Active" },
  inactive: { icon: WifiOff, color: "text-gray-400", bg: "bg-white/5", border: "border-white/10", label: "Inactive" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Error" },
  syncing: { icon: RefreshCw, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", label: "Syncing" },
};

const DATA_TYPE_COLORS: Record<string, string> = {
  "Structured Data": "bg-purple-400/10 text-purple-400 border-purple-400/20",
  "Official Stats": "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  "Media / Visuals": "bg-pink-400/10 text-pink-400 border-pink-400/20",
  "Context Only": "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  "Odds & Lines": "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
};

export function ProviderStatusCard({
  provider, displayName, status, isLive, apiKeyConfigured,
  supportedSports, supportedMarkets, requestsUsed, requestLimit,
  lastSync, lastError, recordCount, dataTypes, onSync,
}: Props) {
  const sc = STATUS_CONFIG[status];
  const StatusIcon = sc.icon;
  const usagePercent = requestLimit ? Math.min(100, ((requestsUsed || 0) / requestLimit) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#0A0E17] rounded-2xl border ${sc.border} overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-xl flex items-center justify-center ${sc.bg}`}>
            <Server className={`size-5 ${sc.color}`} />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              {displayName}
              {isLive && apiKeyConfigured && (
                <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusIcon className={`size-3 ${sc.color}`} />
              <span className={`text-[10px] ${sc.color}`}>{sc.label}</span>
              {!apiKeyConfigured && (
                <span className="text-[10px] text-red-400">• API Key Required</span>
              )}
            </div>
          </div>
        </div>

        {/* Sync button */}
        {onSync && apiKeyConfigured && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSync}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`size-3 ${status === "syncing" ? "animate-spin" : ""}`} />
            Sync
          </motion.button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Data type badges */}
        {dataTypes && dataTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {dataTypes.map(dt => (
              <span
                key={dt}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${DATA_TYPE_COLORS[dt] || "bg-white/5 text-muted-foreground border-white/10"}`}
              >
                {dt}
              </span>
            ))}
          </div>
        )}

        {/* Sports badges */}
        <div className="flex flex-wrap gap-1">
          {supportedSports.map(s => (
            <span key={s} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono">{s}</span>
          ))}
        </div>

        {/* Rate limit bar */}
        {requestLimit && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <BarChart3 className="size-3" />
                {requestsUsed || 0} / {requestLimit} requests
              </span>
              <span className={usagePercent > 80 ? "text-red-400" : "text-emerald-400"}>
                {(100 - usagePercent).toFixed(0)}% remaining
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                className={`h-full rounded-full ${usagePercent > 80 ? "bg-red-400" : usagePercent > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Last sync */}
        {lastSync && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="size-3" />
            Last sync: {new Date(lastSync).toLocaleString()}
            {recordCount !== undefined && <span>• {recordCount} records</span>}
          </div>
        )}

        {/* Error */}
        {lastError && (
          <div className="flex items-center gap-2 text-[10px] text-red-400 bg-red-400/5 rounded-lg px-3 py-1.5">
            <AlertTriangle className="size-3 shrink-0" />
            <span className="truncate">{lastError}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
