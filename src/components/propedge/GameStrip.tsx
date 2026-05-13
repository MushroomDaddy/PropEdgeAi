/** L5/L10 game strip showing hit/miss for recent games */
export function GameStrip({
  results, line, label,
}: {
  results: { value: number; opponent: string }[];
  line: number;
  label?: string;
}) {
  return (
    <div className="space-y-1">
      {label && <div className="text-[10px] text-muted-foreground">{label}</div>}
      <div className="flex gap-1">
        {results.map((r, i) => {
          const hit = r.value > line;
          return (
            <div
              key={i}
              className={`relative group w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                hit ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}
              title={`vs ${r.opponent}: ${r.value} (line: ${line})`}
            >
              {Math.round(r.value)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
