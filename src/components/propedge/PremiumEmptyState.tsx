import { motion } from "framer-motion";
import { Database, Radio, RefreshCw, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumEmptyStateProps {
  type: "no-sync" | "no-data" | "loading" | "coming-soon";
  title?: string;
  description?: string;
  icon?: LucideIcon;
  providerStatus?: { name: string; status: string; lastSync?: number }[];
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function PremiumEmptyState({
  type,
  title,
  description,
  icon: CustomIcon,
  providerStatus,
  onAction,
  actionLabel,
  className,
}: PremiumEmptyStateProps) {
  const presets = {
    "no-sync": {
      icon: Radio,
      title: "Live Data Not Synced Yet",
      description: "Connect your API key and run a full sync to start tracking real odds, props, and line movements.",
      actionLabel: "Learn How to Sync",
      gradient: "from-emerald-500/10 via-transparent to-cyan-500/10",
      iconColor: "text-emerald-400",
      ringColor: "ring-emerald-500/20",
    },
    "no-data": {
      icon: Database,
      title: "No Props Available",
      description: "There are no props to display right now. Check back when games are scheduled.",
      gradient: "from-purple-500/10 via-transparent to-amber-500/10",
      iconColor: "text-purple-400",
      ringColor: "ring-purple-500/20",
    },
    "loading": {
      icon: RefreshCw,
      title: "Loading Data...",
      description: "Fetching the latest odds and player props.",
      gradient: "from-cyan-500/10 via-transparent to-purple-500/10",
      iconColor: "text-cyan-400",
      ringColor: "ring-cyan-500/20",
    },
    "coming-soon": {
      icon: Zap,
      title: "Coming Soon",
      description: "This feature is under development. Stay tuned!",
      gradient: "from-amber-500/10 via-transparent to-emerald-500/10",
      iconColor: "text-amber-400",
      ringColor: "ring-amber-500/20",
    },
  };

  const preset = presets[type];
  const Icon = CustomIcon || preset.icon;
  const displayTitle = title || preset.title;
  const displayDesc = description || preset.description;
  const displayAction = actionLabel || (preset as any).actionLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl border border-white/[0.06] overflow-hidden",
        className,
      )}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", preset.gradient)} />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative flex flex-col items-center justify-center py-16 px-8 text-center">
        {/* Animated icon */}
        <motion.div
          className={cn("size-20 rounded-2xl ring-1 flex items-center justify-center mb-6", preset.ringColor)}
          style={{ background: "rgba(255,255,255,0.02)" }}
          animate={type === "loading" ? { rotate: 360 } : { y: [0, -4, 0] }}
          transition={type === "loading" ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className={cn("size-8", preset.iconColor)} />
        </motion.div>

        <h3 className="text-lg font-bold text-white mb-2">{displayTitle}</h3>
        <p className="text-sm text-muted-foreground/70 max-w-md leading-relaxed">{displayDesc}</p>

        {/* Provider Status Mini Cards */}
        {providerStatus && providerStatus.length > 0 && (
          <div className="flex items-center gap-3 mt-6">
            {providerStatus.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className={cn(
                  "size-2 rounded-full",
                  p.status === "connected" ? "bg-emerald-400" :
                  p.status === "error" ? "bg-red-400" :
                  "bg-amber-400",
                )} />
                <span className="text-xs font-medium text-muted-foreground">{p.name}</span>
                {p.lastSync && (
                  <span className="text-[9px] text-muted-foreground/40">
                    {Math.round((Date.now() - p.lastSync) / 60000)}m ago
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {onAction && displayAction && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAction}
            className="mt-6 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-white hover:bg-white/[0.1] transition-colors"
          >
            {displayAction}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
