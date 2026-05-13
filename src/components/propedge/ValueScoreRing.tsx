/** Animated SVG ring showing value score 0-100 */
export function ValueScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? "#00FF88" : pct >= 40 ? "#FBBF24" : "#EF4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-sm font-bold font-mono" style={{ color }}>{pct}</span>
      </div>
      {label && <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>}
    </div>
  );
}
