/** Vertical risk meter 0-100 — higher = riskier */
export function RiskMeter({ risk, size = "sm" }: { risk: number; size?: "sm" | "md" }) {
  const h = size === "md" ? "h-16" : "h-10";
  const pct = Math.max(0, Math.min(100, risk));
  const color = pct <= 30 ? "bg-emerald-400" : pct <= 60 ? "bg-yellow-400" : "bg-red-400";
  const label = pct <= 30 ? "Low" : pct <= 60 ? "Med" : "High";

  return (
    <div className="flex items-end gap-1.5">
      <div className={`w-3 ${h} bg-white/5 rounded-full overflow-hidden flex flex-col justify-end`}>
        <div className={`w-full rounded-full transition-all duration-500 ${color}`} style={{ height: `${pct}%` }} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-xs font-mono font-bold">{pct}%</span>
      </div>
    </div>
  );
}
