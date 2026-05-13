/** Compact line movement chart for prop cards */
export function LineMovementMiniChart({
  snapshots, width = 120, height = 40,
}: {
  snapshots: { timestamp: number; line: number }[];
  width?: number; height?: number;
}) {
  if (snapshots.length < 2) return null;
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
  const lines = sorted.map((s) => s.line);
  const min = Math.min(...lines);
  const max = Math.max(...lines);
  const range = max - min || 0.5;
  const pad = 4;

  const points = sorted.map((s, i) => {
    const x = pad + (i / (sorted.length - 1)) * (width - pad * 2);
    const y = height - pad - ((s.line - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  const moved = lines[lines.length - 1] - lines[0];
  const color = moved > 0 ? "#00FF88" : moved < 0 ? "#EF4444" : "#00D4FF";

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <svg width={width} height={height}>
        <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} opacity={0.8} />
        {sorted.map((s, i) => {
          const x = pad + (i / (sorted.length - 1)) * (width - pad * 2);
          const y = height - pad - ((s.line - min) / range) * (height - pad * 2);
          return <circle key={i} cx={x} cy={y} r={2} fill={color} />;
        })}
      </svg>
      <div className="flex items-center gap-1 text-[10px]">
        <span className="text-muted-foreground">{lines[0]}</span>
        <span style={{ color }}>→</span>
        <span style={{ color }} className="font-bold">{lines[lines.length - 1]}</span>
      </div>
    </div>
  );
}
