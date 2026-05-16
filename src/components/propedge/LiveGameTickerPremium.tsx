/**
 * LiveGameTickerPremium — R13 Premium Visual
 *
 * Horizontal scrolling game ticker with live scores,
 * animated score updates, and team colors.
 */

import { motion } from "framer-motion";
import { ChevronRight, Radio } from "lucide-react";
import { getSportIcon, getTeamAbbr, getTeamColors } from "../../lib/assets";

interface TickerGame {
	homeTeam: string;
	awayTeam: string;
	homeScore?: number;
	awayScore?: number;
	status: "upcoming" | "live" | "final";
	gameTime?: string;
	period?: string;
	sport?: string;
}

interface Props {
	games: TickerGame[];
	onGameClick?: (game: TickerGame) => void;
}

function TickerItem({
	game,
	onClick,
}: {
	game: TickerGame;
	onClick?: () => void;
}) {
	const homeColors = getTeamColors(game.homeTeam);
	const awayColors = getTeamColors(game.awayTeam);
	const isLive = game.status === "live";
	const isFinal = game.status === "final";

	return (
		<motion.div
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.97 }}
			onClick={onClick}
			className={`flex-shrink-0 w-48 bg-[#0D1117] rounded-xl border cursor-pointer overflow-hidden ${
				isLive ? "border-red-400/30" : "border-white/5"
			}`}
		>
			{/* Status header */}
			<div
				className={`flex items-center justify-center gap-1.5 py-1 text-[9px] font-bold ${
					isLive
						? "bg-red-500/10 text-red-400"
						: isFinal
							? "bg-white/5 text-muted-foreground"
							: "bg-cyan-400/5 text-cyan-400"
				}`}
			>
				{isLive && (
					<span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
				)}
				{isLive
					? game.period || "LIVE"
					: isFinal
						? "FINAL"
						: game.gameTime || "TBD"}
				<span className="ml-1 opacity-50">
					{getSportIcon(game.sport || "")}
				</span>
			</div>

			{/* Teams */}
			<div className="p-2.5 space-y-1.5">
				{/* Away team */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className="size-5 rounded flex items-center justify-center text-[8px] font-black"
							style={{
								background: `${awayColors.primary}30`,
								color: awayColors.primary,
							}}
						>
							{getTeamAbbr(game.awayTeam).slice(0, 2)}
						</div>
						<span className="text-[11px] font-medium truncate max-w-[80px]">
							{game.awayTeam}
						</span>
					</div>
					{game.awayScore !== undefined && (
						<motion.span
							key={game.awayScore}
							initial={{ scale: 1.3, color: "#00D4FF" }}
							animate={{ scale: 1, color: "#ffffff" }}
							className="text-sm font-black font-mono"
						>
							{game.awayScore}
						</motion.span>
					)}
				</div>

				{/* Home team */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className="size-5 rounded flex items-center justify-center text-[8px] font-black"
							style={{
								background: `${homeColors.primary}30`,
								color: homeColors.primary,
							}}
						>
							{getTeamAbbr(game.homeTeam).slice(0, 2)}
						</div>
						<span className="text-[11px] font-medium truncate max-w-[80px]">
							{game.homeTeam}
						</span>
					</div>
					{game.homeScore !== undefined && (
						<motion.span
							key={game.homeScore}
							initial={{ scale: 1.3, color: "#00D4FF" }}
							animate={{ scale: 1, color: "#ffffff" }}
							className="text-sm font-black font-mono"
						>
							{game.homeScore}
						</motion.span>
					)}
				</div>
			</div>
		</motion.div>
	);
}

export function LiveGameTickerPremium({ games, onGameClick }: Props) {
	if (!games.length) return null;

	const liveCount = games.filter((g) => g.status === "live").length;

	return (
		<div className="space-y-2">
			{/* Header */}
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<Radio className="size-4 text-red-400" />
					<span className="text-xs font-bold">Live Scores</span>
					{liveCount > 0 && (
						<span className="px-1.5 py-0.5 bg-red-400/10 text-red-400 rounded-full text-[10px] font-bold">
							{liveCount} LIVE
						</span>
					)}
				</div>
				<button
					className="flex items-center gap-0.5 text-[10px] text-cyan-400 hover:text-cyan-300"
					type="button"
				>
					View All <ChevronRight className="size-3" />
				</button>
			</div>

			{/* Scrolling ticker */}
			<div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
				{games.map((game, i) => (
					<TickerItem key={i} game={game} onClick={() => onGameClick?.(game)} />
				))}
			</div>
		</div>
	);
}
