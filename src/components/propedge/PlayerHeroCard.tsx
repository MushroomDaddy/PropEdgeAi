import { motion } from "framer-motion";
import {
	AlertTriangle,
	Flame,
	Heart,
	Shield,
	Snowflake,
	TrendingUp,
	User,
	Zap,
} from "lucide-react";
import {
	getPlayerInitials,
	getSportIcon,
	getTeamAbbr,
	getTeamColors,
} from "@/lib/assets";
import { cn } from "@/lib/utils";
import { DataSourceBadge } from "./Badges";

interface PlayerHeroCardProps {
	name: string;
	team: string;
	position: string;
	sport: string;
	injuryStatus?: string;
	recentForm?: string;
	imageUrl?: string;
	teamLogoUrl?: string;
	jerseyNumber?: number;
	teamColor?: string;
	dataSource?: string;
}

export function PlayerHeroCard({
	name,
	team,
	position,
	sport,
	injuryStatus,
	recentForm,
	imageUrl,
	teamLogoUrl,
	jerseyNumber,
	teamColor: teamColorProp,
	dataSource = "demo",
}: PlayerHeroCardProps) {
	const colors = getTeamColors(team, teamColorProp);
	const isHealthy =
		!injuryStatus || injuryStatus === "Active" || injuryStatus === "healthy";
	const isHot = recentForm === "hot" || recentForm === "🔥";
	const isCold = recentForm === "cold" || recentForm === "🥶";
	const initials = getPlayerInitials(name);
	const teamAbbr = getTeamAbbr(team);

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
			className="relative rounded-2xl border border-white/[0.08] overflow-hidden"
		>
			{/* Team color gradient background */}
			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(135deg, ${colors.primary}30 0%, transparent 40%, ${colors.secondary}15 70%, transparent 100%)`,
				}}
			/>

			{/* Glow effect */}
			<div
				className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
				style={{ background: colors.primary }}
			/>
			<div
				className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-10"
				style={{ background: colors.secondary }}
			/>

			{/* Grid overlay */}
			<div
				className="absolute inset-0 opacity-[0.015]"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>

			{/* Large jersey number watermark */}
			{jerseyNumber !== undefined && (
				<div
					className="absolute -right-4 -bottom-8 text-[140px] font-black leading-none pointer-events-none select-none"
					style={{ color: `${colors.primary}08` }}
				>
					{jerseyNumber}
				</div>
			)}

			<div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8">
				{/* Player avatar */}
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.1, duration: 0.3 }}
					className="relative shrink-0"
				>
					{/* Outer glow ring */}
					<div
						className="absolute -inset-1 rounded-2xl opacity-40 blur-sm"
						style={{
							background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
						}}
					/>

					<div
						className="relative size-28 md:size-32 rounded-2xl border-2 flex items-center justify-center overflow-hidden"
						style={{
							borderColor: `${colors.primary}50`,
							background: `linear-gradient(135deg, ${colors.primary}18, ${colors.secondary}10)`,
						}}
					>
						{imageUrl ? (
							<img
								src={imageUrl}
								alt={name}
								className="size-full object-cover"
							/>
						) : (
							/* Premium silhouette fallback */
							<div className="relative size-full flex flex-col items-center justify-center">
								{/* Sport icon background */}
								<div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
									<span className="text-6xl">{getSportIcon(sport)}</span>
								</div>
								{/* Player silhouette */}
								<User className="size-12 text-white/20 mb-1" />
								{jerseyNumber !== undefined ? (
									<span
										className="text-xl font-black font-mono"
										style={{ color: `${colors.primary}60` }}
									>
										#{jerseyNumber}
									</span>
								) : (
									<span
										className="text-2xl font-black"
										style={{ color: `${colors.primary}40` }}
									>
										{initials}
									</span>
								)}
							</div>
						)}
					</div>
				</motion.div>

				{/* Player info */}
				<div className="flex-1 min-w-0 space-y-3">
					<motion.div
						initial={{ opacity: 0, x: -12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.15, duration: 0.3 }}
					>
						<div className="flex items-center gap-3 mb-1.5">
							<h2 className="text-2xl md:text-3xl font-bold truncate text-white">
								{name}
							</h2>
							<DataSourceBadge source={dataSource} />
						</div>

						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							{/* Team badge */}
							{teamLogoUrl ? (
								<img
									src={teamLogoUrl}
									alt={team}
									className="size-6 rounded object-contain"
								/>
							) : (
								<div
									className="size-6 rounded-lg border flex items-center justify-center text-[9px] font-extrabold tracking-tight"
									style={{
										borderColor: `${colors.primary}40`,
										background: `linear-gradient(135deg, ${colors.primary}25, ${colors.secondary}15)`,
										color: colors.primary,
									}}
								>
									{teamAbbr.slice(0, 2)}
								</div>
							)}
							<span className="font-semibold text-white/80">{team}</span>
							<span className="text-white/20">·</span>
							<span className="text-white/60">{position}</span>
							<span className="text-white/20">·</span>
							<span className="text-white/60 flex items-center gap-1">
								<span>{getSportIcon(sport)}</span> {sport}
							</span>
							{jerseyNumber !== undefined && (
								<>
									<span className="text-white/20">·</span>
									<span className="font-mono text-white/50">
										#{jerseyNumber}
									</span>
								</>
							)}
						</div>
					</motion.div>

					{/* Badges row */}
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25, duration: 0.3 }}
						className="flex items-center gap-2.5 flex-wrap"
					>
						{/* Health */}
						<span
							className={cn(
								"inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold border backdrop-blur-sm",
								isHealthy
									? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
									: injuryStatus === "GTD"
										? "bg-amber-500/10 text-amber-400 border-amber-500/20"
										: "bg-red-500/10 text-red-400 border-red-500/20",
							)}
						>
							{isHealthy ? (
								<Heart className="size-3" />
							) : (
								<AlertTriangle className="size-3" />
							)}
							{isHealthy ? "Healthy" : injuryStatus}
						</span>

						{/* Form */}
						{recentForm && (
							<span
								className={cn(
									"inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold border backdrop-blur-sm",
									isHot
										? "bg-orange-500/10 text-orange-400 border-orange-500/20"
										: isCold
											? "bg-blue-500/10 text-blue-400 border-blue-500/20"
											: "bg-white/5 text-white/60 border-white/10",
								)}
							>
								{isHot ? (
									<Flame className="size-3" />
								) : isCold ? (
									<Snowflake className="size-3" />
								) : (
									<TrendingUp className="size-3" />
								)}
								{isHot ? "Hot Streak" : isCold ? "Cold Stretch" : "Consistent"}
							</span>
						)}

						{/* Position badge */}
						<span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-white/[0.06] bg-white/[0.03] text-white/50">
							<Shield className="size-2.5" />
							{position}
						</span>
					</motion.div>
				</div>

				{/* Decorative element */}
				<div className="hidden lg:flex flex-col items-center gap-2">
					<motion.div
						animate={{ rotate: [0, 5, -5, 0] }}
						transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
					>
						<Zap className="size-14 text-white/[0.04]" />
					</motion.div>
				</div>
			</div>
		</motion.div>
	);
}
