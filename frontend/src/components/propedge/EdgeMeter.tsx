/** Horizontal edge meter — shows edge percentage with color gradient */
export function EdgeMeter({ edge, max = 20 }: { edge: number; max?: number }) {
	const pct = Math.min(100, (Math.abs(edge) / max) * 100);
	const isPositive = edge > 0;
	const color = isPositive
		? edge >= 10
			? "bg-emerald-400"
			: "bg-emerald-500/80"
		: edge <= -10
			? "bg-red-400"
			: "bg-red-500/80";

	return (
		<div className="flex items-center gap-2 w-full">
			<div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-500 ${color}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span
				className={`text-xs font-mono font-bold min-w-[40px] text-right ${isPositive ? "text-emerald-400" : "text-red-400"}`}
			>
				{edge > 0 ? "+" : ""}
				{edge}%
			</span>
		</div>
	);
}
