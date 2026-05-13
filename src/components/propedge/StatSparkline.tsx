/** Tiny inline sparkline for stat trends */
export function StatSparkline({
  data, line, width = 100, height = 32, color = "#00D4FF",
}: {
  data: number[]; line?: number; width?: number; height?: number; color?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  const lineY = line !== undefined
    ? height - pad - ((line - min) / range) * (height - pad * 2)
    : undefined;

  return (
    <svg width={width} height={height} className="inline-block">
      {lineY !== undefined && (
        <line x1={pad} y1={lineY} x2={width - pad} y2={lineY} stroke="#EF4444" strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
      )}
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} />
      {/* Last point dot */}
      {data.length > 0 && (() => {
        const lastX = pad + ((data.length - 1) / (data.length - 1)) * (width - pad * 2);
        const lastY = height - pad - ((data[data.length - 1] - min) / range) * (height - pad * 2);
        return <circle cx={lastX} cy={lastY} r={2.5} fill={color} />;
      })()}
    </svg>
  );
}
