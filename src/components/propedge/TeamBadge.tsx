/** Team badge — logo + team color strip */
export function TeamBadge({
	team,
	logoUrl,
	color,
	secondaryColor,
	size = "sm",
}: {
	team: string;
	logoUrl?: string;
	color?: string;
	secondaryColor?: string;
	size?: "sm" | "md" | "lg";
}) {
	const dims = size === "lg" ? "size-10" : size === "md" ? "size-8" : "size-6";
	const textSize =
		size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]";
	const teamAbbr = team.split(" ").pop() || team;
	const bgColor = color || "#333";

	return (
		<div className="flex items-center gap-1.5">
			{logoUrl ? (
				<img
					src={logoUrl}
					alt={team}
					className={`${dims} rounded-full object-cover`}
				/>
			) : (
				<div
					className={`${dims} rounded-full flex items-center justify-center text-white font-bold ${textSize}`}
					style={{ backgroundColor: bgColor }}
				>
					{teamAbbr.charAt(0)}
				</div>
			)}
			<span className={`${textSize} font-medium text-muted-foreground`}>
				{teamAbbr}
			</span>
			{secondaryColor && (
				<div
					className="w-1 h-4 rounded-full"
					style={{
						background: `linear-gradient(${bgColor}, ${secondaryColor})`,
					}}
				/>
			)}
		</div>
	);
}
