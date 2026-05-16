/**
 * TeamMatchupCard — R13 Premium Visual
 *
 * Head-to-head matchup card with team colors, VS divider, and key metrics.
 */

import { motion } from "framer-motion";
import { MapPin, Swords } from "lucide-react";
import { getSportIcon, getTeamAbbr, getTeamColors } from "../../lib/assets";

interface TeamSide {
	name: string;
	score?: number;
	record?: string;
	logoUrl?: string;
}

interface Props {
	homeTeam: TeamSide;
	awayTeam: TeamSide;
	gameTime?: string;
	venue?: string;
	sport?: string;
	status?: "upcoming" | "live" | "final";
	spread?: string;
	total?: string;
	onClick?: () => void;
}

function TeamHalf({
	team,
	side,
	colors,
}: {
	team: TeamSide;
	side: "home" | "away";
	colors: { primary: string; secondary: string };
}) {
	const abbr = getTeamAbbr(team.name);
	return (
		<div
			className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 ${side === "home" ? "items-end text-right" : "items-start text-left"}`}
		>
			{team.logoUrl ? (
				<img
					src={team.logoUrl}
					alt={team.name}
					className="size-12 object-contain"
				/>
			) : (
				<div
					className="size-12 rounded-xl flex items-center justify-center text-sm font-black"
					style={{
						background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
					}}
				>
					{abbr}
				</div>
			)}
			<div>
				<div className="text-xs font-bold truncate max-w-[100px]">
					{team.name}
				</div>
				{team.record && (
					<div className="text-[10px] text-muted-foreground">{team.record}</div>
				)}
			</div>
			{team.score !== undefined && (
				<div
					className="text-2xl font-black font-mono"
					style={{ color: colors.primary }}
				>
					{team.score}
				</div>
			)}
		</div>
	);
}

export function TeamMatchupCard({
	homeTeam,
	awayTeam,
	gameTime,
	venue,
	sport,
	status = "upcoming",
	spread,
	total,
	onClick,
}: Props) {
	const homeColors = getTeamColors(homeTeam.name);
	const awayColors = getTeamColors(awayTeam.name);

	return (
		<motion.div
			whileHover={{ scale: 1.01 }}
			onClick={onClick}
			className="relative bg-[#0A0E17] rounded-2xl border border-white/10 overflow-hidden cursor-pointer group"
		>
			{/* Dual gradient background */}
			<div
				className="absolute inset-0 opacity-10"
				style={{
					background: `linear-gradient(to right, ${awayColors.primary}40, transparent 40%, transparent 60%, ${homeColors.primary}40)`,
				}}
			/>

			{/* Status bar */}
			<div
				className={`flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold border-b border-white/5 ${
					status === "live"
						? "bg-red-500/10 text-red-400"
						: status === "final"
							? "bg-white/5 text-muted-foreground"
							: "bg-cyan-400/5 text-cyan-400"
				}`}
			>
				{status === "live" && (
					<span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
				)}
				{status === "live"
					? "LIVE"
					: status === "final"
						? "FINAL"
						: gameTime || "TBD"}
				<span className="opacity-50">{getSportIcon(sport || "")}</span>
			</div>

			{/* Matchup body */}
			<div className="relative flex items-center">
				<TeamHalf team={awayTeam} side="away" colors={awayColors} />

				{/* VS divider */}
				<div className="flex flex-col items-center gap-1 px-3">
					<div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
						<Swords className="size-4 text-muted-foreground" />
					</div>
					<span className="text-[8px] text-muted-foreground font-bold">VS</span>
				</div>

				<TeamHalf team={homeTeam} side="home" colors={homeColors} />
			</div>

			{/* Footer: odds/spread */}
			{(spread || total || venue) && (
				<div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-[10px] text-muted-foreground">
					<div className="flex items-center gap-3">
						{spread && <span className="font-mono">SPR {spread}</span>}
						{total && <span className="font-mono">O/U {total}</span>}
					</div>
					{venue && (
						<div className="flex items-center gap-1">
							<MapPin className="size-2.5" />
							<span className="truncate max-w-[120px]">{venue}</span>
						</div>
					)}
				</div>
			)}
		</motion.div>
	);
}
