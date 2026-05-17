/** Confidence meter — arc or pill showing confidence level 0-100 */
export function ConfidenceMeter({
	confidence,
	compact,
}: {
	confidence: number;
	compact?: boolean;
}) {
	const pct = Math.max(0, Math.min(100, confidence));
	const color =
		pct >= 75
			? "text-emerald-400"
			: pct >= 55
				? "text-yellow-400"
				: "text-red-400";
	const bg =
		pct >= 75
			? "bg-emerald-400/15"
			: pct >= 55
				? "bg-yellow-400/15"
				: "bg-red-400/15";
	const label = pct >= 75 ? "High" : pct >= 55 ? "Medium" : "Low";

	if (compact) {
		return (
			<span
				className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${bg} ${color}`}
			>
				{pct}%
			</span>
		);
	}

	return (
		<div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${bg}`}>
			<div className="flex gap-0.5">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className={`w-1.5 rounded-full transition-all ${i <= Math.ceil(pct / 20) ? color.replace("text-", "bg-") : "bg-white/10"}`}
						style={{ height: `${8 + i * 3}px` }}
					/>
				))}
			</div>
			<div className="flex flex-col">
				<span className={`text-xs font-bold ${color}`}>{label}</span>
				<span className="text-[10px] text-muted-foreground">{pct}% conf</span>
			</div>
		</div>
	);
}
