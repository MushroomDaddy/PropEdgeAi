import { Activity, BarChart3, Bot, Search, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
	ConfidenceMeter,
	DataSourceBadge,
	DemoBanner,
	EdgeBadge,
	EdgeMeter,
	EmptyState,
	GameLogTable,
	GameStrip,
	HitRateHeatmap,
	LineMovementTimeline,
	PlayerHeroCard,
	PropDetailDrawer,
	PropOpportunityCard,
	SkeletonCard,
	StatSparkline,
	StatTrendCard,
	TeamBadge,
	ValueScoreRing,
} from "@/components/propedge";
import { formatDirection, formatLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { usePlayerSearch, usePlayerProfile } from "../hooks/api/usePlayers";
import { useAddPick } from "../hooks/api/usePicks";

const TABS = [
	{ id: "overview", label: "Overview" },
	{ id: "props", label: "Props" },
	{ id: "gamelogs", label: "Game Logs" },
	{ id: "splits", label: "Splits" },
	{ id: "matchups", label: "Matchups" },
	{ id: "linemovement", label: "Line Movement" },
	{ id: "results", label: "Results History" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PlayerIntelPage() {
	const [searchParams] = useSearchParams();
	const qParam = searchParams.get("q") || "";
	const [searchTerm, setSearchTerm] = useState(qParam);
	const [selectedPlayer, setSelectedPlayer] = useState<string | null>(
		qParam || null,
	);
	const [activeTab, setActiveTab] = useState<TabId>("overview");
	const [drawerProp, setDrawerProp] = useState<any>(null);

	// Auto-load from ?q= URL param on mount / param change
	useEffect(() => {
		if (qParam && qParam !== selectedPlayer) {
			setSearchTerm(qParam);
			setSelectedPlayer(qParam);
			setActiveTab("overview");
		}
	}, [qParam, selectedPlayer]);

	const { data: searchResults } = usePlayerSearch(searchTerm.length >= 2 ? searchTerm : "");
	const { data: profile } = usePlayerProfile(selectedPlayer ?? undefined);

	return (
		<div className="space-y-5">
			<DemoBanner message="DEMO DATA — Player stats are mock data for demonstration. Connect live stat APIs for real game logs." />

			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
					Player Intelligence
				</h1>
				<DataSourceBadge source="demo" />
			</div>

			{/* Search */}
			<div className="relative max-w-lg">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search any player..."
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						if (selectedPlayer) setSelectedPlayer(null);
					}}
					className="w-full rounded-xl border border-white/10 bg-card/50 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all placeholder:text-muted-foreground/50"
				/>
				{searchResults && searchResults.length > 0 && !selectedPlayer && (
					<div className="absolute top-full mt-2 left-0 right-0 rounded-xl border border-white/10 bg-card shadow-2xl z-50 max-h-64 overflow-auto">
						{searchResults.map((p: any) => (
							<button
								type="button"
								key={p._id}
								onClick={() => {
									setSelectedPlayer(p.name);
									setSearchTerm(p.name);
									setActiveTab("overview");
								}}
								className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors"
							>
								<div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
									<User className="size-4 text-emerald-400/60" />
								</div>
								<div>
									<div className="font-medium text-sm">{p.name}</div>
									<div className="text-xs text-muted-foreground">
										{p.team} · {p.position} · {p.sport}
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Profile */}
			{profile ? (
				<PlayerProfileView
					profile={profile}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					onOpenPropDrawer={setDrawerProp}
				/>
			) : selectedPlayer ? (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{Array.from({ length: 8 }).map((_, i) => (
						<SkeletonCard key={i} />
					))}
				</div>
			) : (
				<EmptyState
					icon={User}
					title="Search for a player"
					description="View full intelligence profiles with game logs, splits, prop hit rates, matchups, trends & more"
				/>
			)}

			{/* Prop Detail Drawer */}
			<PropDetailDrawerWithPicks
				prop={drawerProp}
				onClose={() => setDrawerProp(null)}
			/>
		</div>
	);
}

/* ═══════════════════════════════════════════════════
   PropDetailDrawer with Add to Picks wired
   ═══════════════════════════════════════════════════ */

function PropDetailDrawerWithPicks({
	prop,
	onClose,
}: {
	prop: any;
	onClose: () => void;
}) {
	const addPick = useAddPick();

	const handleAddToPicks = prop?.propId
		? async () => {
				try {
					await addPick.mutateAsync({ propId: prop.propId });
					onClose();
				} catch {
					// Prop may not have a valid propId (demo) — silently handle
				}
			}
		: undefined;

	return (
		<PropDetailDrawer
			prop={prop}
			onClose={onClose}
			onAddToPicks={handleAddToPicks}
		/>
	);
}

/* ═══════════════════════════════════════════════════
   Player Profile View
   ═══════════════════════════════════════════════════ */

function PlayerProfileView({
	profile,
	activeTab,
	setActiveTab,
	onOpenPropDrawer,
}: {
	profile: any;
	activeTab: TabId;
	setActiveTab: (t: TabId) => void;
	onOpenPropDrawer: (p: any) => void;
}) {
	const p = profile.player;

	// Best prop = highest edge
	const sortedProps = [...(profile.currentProps || [])].sort(
		(a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge),
	);
	const topProp = sortedProps[0];
	const top3Props = sortedProps.slice(0, 3);

	return (
		<div className="space-y-5">
			{/* Hero */}
			<PlayerHeroCard
				name={p.name}
				team={p.team}
				position={p.position}
				sport={p.sport}
				injuryStatus={p.injuryStatus}
				recentForm={p.recentForm}
				imageUrl={p.imageUrl}
				teamLogoUrl={p.teamLogoUrl}
				jerseyNumber={p.jerseyNumber}
				teamColor={p.teamColor}
				dataSource="demo"
			/>

			{/* Top Prop Recommendations */}
			{top3Props.length > 0 && (
				<div className="grid md:grid-cols-3 gap-3">
					{top3Props.map((cp: any, i: number) => (
						<PropOpportunityCard
							key={i}
							statType={cp.statType}
							line={cp.line}
							projection={cp.projection}
							edge={cp.edge}
							overUnder={cp.overUnder}
							platform={cp.platform}
							confidence={cp.confidence}
							modelProb={cp.modelProb}
							isTop={i === 0}
							onClick={() =>
								onOpenPropDrawer({
									...cp,
									playerName: p.name,
								})
							}
						/>
					))}
				</div>
			)}

			{/* AI Summary Card */}
			<AISummaryCard player={p} topProp={topProp} profile={profile} />

			{/* Tabs */}
			<div className="border-b border-white/10">
				<nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-hide">
					{TABS.map((tab) => (
						<button
							type="button"
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
								activeTab === tab.id
									? "border-emerald-400 text-emerald-400"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-white/20",
							)}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			{/* Tab Content */}
			{activeTab === "overview" && (
				<OverviewTab profile={profile} onOpenPropDrawer={onOpenPropDrawer} />
			)}
			{activeTab === "props" && (
				<PropsTab profile={profile} onOpenPropDrawer={onOpenPropDrawer} />
			)}
			{activeTab === "gamelogs" && <GameLogsTab profile={profile} />}
			{activeTab === "splits" && <SplitsTab profile={profile} />}
			{activeTab === "matchups" && <MatchupsTab profile={profile} />}
			{activeTab === "linemovement" && <LineMovementTab profile={profile} />}
			{activeTab === "results" && <ResultsHistoryTab profile={profile} />}
		</div>
	);
}

/* ═══════ AI Summary Card ═══════ */
function AISummaryCard({
	player,
	topProp,
	profile,
}: {
	player: any;
	topProp: any;
	profile: any;
}) {
	const seasonPts = profile.seasonAvg?.points;
	const l5Pts = profile.last5Avg?.points;
	const form =
		player.recentForm === "hot"
			? "on a hot streak"
			: player.recentForm === "cold"
				? "in a cold stretch"
				: "performing consistently";

	return (
		<div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-5">
			<div className="flex items-center gap-2 mb-3">
				<div className="size-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
					<Bot className="size-4 text-purple-400" />
				</div>
				<h3 className="text-sm font-semibold text-purple-400">
					What PropEdge Sees
				</h3>
				<Sparkles className="size-3 text-purple-400/50" />
			</div>
			<p className="text-sm text-muted-foreground leading-relaxed">
				<span className="text-foreground font-medium">{player.name}</span> is{" "}
				{form} for the {player.team}.
				{seasonPts && l5Pts && (
					<>
						{" "}
						Season average of{" "}
						<span className="font-mono text-foreground">{seasonPts}</span> PTS
						with L5 at{" "}
						<span className="font-mono text-foreground">{l5Pts}</span>.
					</>
				)}
				{topProp && (
					<>
						{" "}
						The highest-edge prop is{" "}
						<span className="text-foreground font-medium">
							{formatLabel(topProp.statType)}{" "}
							{formatDirection(topProp.overUnder)} {topProp.line}
						</span>{" "}
						on {formatLabel(topProp.platform)} with{" "}
						<span
							className={topProp.edge > 0 ? "text-emerald-400" : "text-red-400"}
						>
							{topProp.edge > 0 ? "+" : ""}
							{topProp.edge.toFixed(1)}%
						</span>{" "}
						edge.
					</>
				)}
				{profile.propHitRates?.length > 0 &&
					profile.propHitRates.some((pr: any) => pr.hitRate > 70) && (
						<>
							{" "}
							Historical hit rates look strong — check the Heatmap for the best
							angles.
						</>
					)}
			</p>
		</div>
	);
}

/* ═══════ Overview Tab ═══════ */
function OverviewTab({
	profile,
	onOpenPropDrawer: _onOpenPropDrawer,
}: {
	profile: any;
	onOpenPropDrawer: (p: any) => void;
}) {
	const p = profile.player;
	void _onOpenPropDrawer; // available for future prop-click in overview

	// Premium visual identity data
	const bestProp = (profile.currentProps || []).sort(
		(a: any, b: any) => Math.abs(b.edge) - Math.abs(a.edge),
	)[0];
	const recentGames = (profile.gameLogs || []).slice(0, 10);
	const pointsTrend = recentGames.map((g: any) => g.points || 0);

	return (
		<div className="space-y-5">
			{/* Premium Visual Identity Section */}
			<div className="bg-[#0D1117] rounded-xl border border-white/5 p-5 space-y-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-4">
						{p.imageUrl ? (
							<img
								src={p.imageUrl}
								alt={p.name}
								className="size-16 rounded-full object-cover ring-2 ring-white/10"
							/>
						) : (
							<div className="size-16 rounded-full bg-gradient-to-br from-[#00FF88]/20 to-[#00D4FF]/20 flex items-center justify-center text-xl font-bold">
								{p.name
									?.split(" ")
									.map((n: string) => n[0])
									.join("") || "?"}
							</div>
						)}
						<div>
							<div className="flex items-center gap-2">
								<TeamBadge
									team={p.team}
									logoUrl={p.teamLogoUrl}
									color={p.teamColor}
									size="md"
								/>
								{p.jerseyNumber && (
									<span className="text-xs text-muted-foreground">
										#{p.jerseyNumber}
									</span>
								)}
							</div>
							<div className="text-[10px] text-muted-foreground mt-1">
								{p.position} • {p.sport}
							</div>
						</div>
					</div>

					{/* Value + Edge + Confidence */}
					<div className="flex items-center gap-4">
						{bestProp && (
							<>
								<div className="relative">
									<ValueScoreRing
										score={bestProp.confidence || 50}
										size={56}
										label="Confidence"
									/>
								</div>
								<ConfidenceMeter confidence={bestProp.confidence || 50} />
							</>
						)}
					</div>
				</div>

				{/* Top edges row */}
				{bestProp && (
					<div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
						<div>
							<div className="text-[10px] text-muted-foreground">Top Edge</div>
							<div className="flex items-center gap-1">
								<span className="font-bold">
									{formatLabel(bestProp.statType)}
								</span>
								<EdgeMeter edge={bestProp.edge} />
							</div>
						</div>
						<div>
							<div className="text-[10px] text-muted-foreground">
								Trend (L10)
							</div>
							<StatSparkline data={pointsTrend} line={bestProp?.line} />
						</div>
						<div>
							<div className="text-[10px] text-muted-foreground">
								Recent Games
							</div>
							<GameStrip
								results={recentGames.slice(0, 5).map((g: any) => ({
									value: g.points || 0,
									opponent: g.opponent || "?",
								}))}
								line={bestProp?.line || 20}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Stat Trend Cards */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
				<StatTrendCard
					label="PTS"
					l5={profile.last5Avg?.points}
					l10={profile.last10Avg?.points}
					season={profile.seasonAvg?.points}
				/>
				<StatTrendCard
					label="REB"
					l5={profile.last5Avg?.rebounds}
					l10={profile.last10Avg?.rebounds}
					season={profile.seasonAvg?.rebounds}
				/>
				<StatTrendCard
					label="AST"
					l5={profile.last5Avg?.assists}
					l10={profile.last10Avg?.assists}
					season={profile.seasonAvg?.assists}
				/>
				<StatTrendCard
					label="MIN"
					l5={profile.last5Avg?.minutes}
					l10={profile.last10Avg?.minutes}
					season={profile.seasonAvg?.minutes}
				/>
				<StatTrendCard
					label="3PM"
					l5={profile.last5Avg?.threePointers}
					l10={profile.last10Avg?.threePointers}
					season={profile.seasonAvg?.threePointers}
				/>
			</div>

			<div className="grid md:grid-cols-2 gap-5">
				{/* Hit Rate Heatmap */}
				<HitRateHeatmap data={profile.propHitRates} />

				{/* Minutes/Usage Trend Chart */}
				{profile.minutesTrend?.length > 0 && (
					<div className="rounded-xl border border-white/5 bg-card/50 p-4">
						<h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
							<Activity className="size-4 text-amber-400" /> Minutes & Usage
							Trend
						</h3>
						<div className="space-y-1.5">
							{profile.minutesTrend.map((t: any, i: number) => {
								const maxMin = Math.max(
									...profile.minutesTrend.map((m: any) => m.minutes || 1),
								);
								const maxPts = Math.max(
									...profile.minutesTrend.map((m: any) => m.points || 1),
								);
								return (
									<div
										key={i}
										className="flex items-center gap-2 text-xs group"
									>
										<span className="text-muted-foreground/50 w-10 text-[10px] font-mono">
											{new Date(t.date).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</span>
										<span className="w-16 text-muted-foreground/60 truncate text-[10px]">
											vs {t.opponent}
										</span>
										<div className="flex-1 h-5 rounded bg-white/[0.03] overflow-hidden relative">
											<div
												className="absolute inset-y-0 left-0 bg-cyan-500/30 rounded transition-all group-hover:bg-cyan-500/50"
												style={{ width: `${(t.minutes / maxMin) * 100}%` }}
											/>
											<div
												className="absolute inset-y-0 left-0 bg-emerald-500/40 rounded transition-all group-hover:bg-emerald-500/60"
												style={{
													width: `${(t.points / maxPts) * 70}%`,
													top: "25%",
													bottom: "25%",
												}}
											/>
										</div>
										<span className="font-mono w-8 text-right text-muted-foreground">
											{t.minutes}m
										</span>
										<span className="font-mono w-10 text-right text-emerald-400">
											{t.points}pts
										</span>
									</div>
								);
							})}
						</div>
						<div className="flex gap-4 mt-2 text-[10px] text-muted-foreground/50">
							<span className="flex items-center gap-1">
								<div className="size-2 rounded bg-cyan-500/30" /> Minutes
							</span>
							<span className="flex items-center gap-1">
								<div className="size-2 rounded bg-emerald-500/40" /> Points
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Quick Game Log preview */}
			<GameLogTable
				logs={profile.gameLogs || []}
				sport={p.sport}
				initialShow={5}
			/>
		</div>
	);
}

/* ═══════ Props Tab ═══════ */
function PropsTab({
	profile,
	onOpenPropDrawer,
}: {
	profile: any;
	onOpenPropDrawer: (p: any) => void;
}) {
	if (!profile.currentProps?.length) {
		return (
			<EmptyState
				icon={Search}
				title="No current props"
				description="No props currently available for this player"
			/>
		);
	}

	return (
		<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
			{profile.currentProps.map((cp: any, i: number) => (
				<PropOpportunityCard
					key={i}
					statType={cp.statType}
					line={cp.line}
					projection={cp.projection}
					edge={cp.edge}
					overUnder={cp.overUnder}
					platform={cp.platform}
					confidence={cp.confidence}
					modelProb={cp.modelProb}
					isTop={i === 0}
					onClick={() =>
						onOpenPropDrawer({ ...cp, playerName: profile.player.name })
					}
				/>
			))}
		</div>
	);
}

/* ═══════ Game Logs Tab ═══════ */
function GameLogsTab({ profile }: { profile: any }) {
	if (!profile.gameLogs?.length) {
		return (
			<EmptyState
				icon={BarChart3}
				title="No game logs"
				description="No game log data available for this player"
			/>
		);
	}
	return (
		<GameLogTable
			logs={profile.gameLogs}
			sport={profile.player.sport}
			initialShow={20}
		/>
	);
}

/* ═══════ Splits Tab ═══════ */
function SplitsTab({ profile }: { profile: any }) {
	const home = profile.homeAwaySplits?.home;
	const away = profile.homeAwaySplits?.away;

	const stats = ["points", "rebounds", "assists"] as const;
	const labels = { points: "PTS", rebounds: "REB", assists: "AST" };

	return (
		<div className="space-y-5">
			<div className="rounded-xl border border-white/5 bg-card/50 p-5">
				<h3 className="text-sm font-semibold mb-4">Home vs Away Performance</h3>
				<div className="space-y-4">
					{stats.map((stat) => {
						const hVal = home?.[stat] ?? 0;
						const aVal = away?.[stat] ?? 0;
						const maxVal = Math.max(hVal, aVal, 1);
						return (
							<div key={stat} className="space-y-1.5">
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>{labels[stat]}</span>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className="flex items-center gap-2">
										<span className="text-[10px] text-muted-foreground/60 w-8">
											HOME
										</span>
										<div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
											<div
												className="h-full rounded bg-gradient-to-r from-emerald-500/20 to-emerald-500/40 flex items-center px-2 text-xs font-mono font-semibold"
												style={{
													width: `${(hVal / maxVal) * 100}%`,
													minWidth: "40px",
												}}
											>
												{hVal}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-[10px] text-muted-foreground/60 w-8">
											AWAY
										</span>
										<div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
											<div
												className="h-full rounded bg-gradient-to-r from-purple-500/20 to-purple-500/40 flex items-center px-2 text-xs font-mono font-semibold"
												style={{
													width: `${(aVal / maxVal) * 100}%`,
													minWidth: "40px",
												}}
											>
												{aVal}
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* L5 / L10 / Season Comparison */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
				<StatTrendCard
					label="PTS"
					l5={profile.last5Avg?.points}
					l10={profile.last10Avg?.points}
					season={profile.seasonAvg?.points}
				/>
				<StatTrendCard
					label="REB"
					l5={profile.last5Avg?.rebounds}
					l10={profile.last10Avg?.rebounds}
					season={profile.seasonAvg?.rebounds}
				/>
				<StatTrendCard
					label="AST"
					l5={profile.last5Avg?.assists}
					l10={profile.last10Avg?.assists}
					season={profile.seasonAvg?.assists}
				/>
				<StatTrendCard
					label="MIN"
					l5={profile.last5Avg?.minutes}
					l10={profile.last10Avg?.minutes}
					season={profile.seasonAvg?.minutes}
				/>
				<StatTrendCard
					label="3PM"
					l5={profile.last5Avg?.threePointers}
					l10={profile.last10Avg?.threePointers}
					season={profile.seasonAvg?.threePointers}
				/>
			</div>
		</div>
	);
}

/* ═══════ Matchups Tab ═══════ */
function MatchupsTab({ profile }: { profile: any }) {
	const matchups = profile.matchups || [];
	if (!matchups.length) {
		return (
			<EmptyState
				icon={BarChart3}
				title="No matchup data"
				description="No opponent matchup data available"
			/>
		);
	}

	const maxPts = Math.max(...matchups.map((m: any) => m.avgPoints || 1));

	return (
		<div className="rounded-xl border border-white/5 bg-card/50 p-5">
			<h3 className="text-sm font-semibold mb-4">Opponent Matchup History</h3>
			<div className="space-y-2">
				{matchups.map((m: any) => (
					<div key={m.opponent} className="flex items-center gap-3 group">
						<span className="w-28 text-sm font-medium truncate">
							vs {m.opponent}
						</span>
						<span className="text-[10px] text-muted-foreground/50 w-8">
							({m.games}G)
						</span>
						<div className="flex-1 h-7 rounded bg-white/[0.03] overflow-hidden relative">
							<div
								className="h-full rounded bg-gradient-to-r from-cyan-500/20 to-cyan-500/40 transition-all group-hover:from-cyan-500/30 group-hover:to-cyan-500/50"
								style={{ width: `${(m.avgPoints / maxPts) * 100}%` }}
							/>
							<span className="absolute inset-y-0 flex items-center px-3 text-xs font-mono font-semibold">
								{m.avgPoints} PPG
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ═══════ Line Movement Tab ═══════ */
function LineMovementTab({ profile }: { profile: any }) {
	// Use current props + real propSnapshots from Convex
	const props = profile.currentProps || [];
	const snapMap: Record<string, any[]> = profile.propSnapshots || {};

	if (!props.length) {
		return (
			<EmptyState
				icon={Activity}
				title="No line movement data"
				description="No props available to show line movement"
			/>
		);
	}

	return (
		<div className="grid md:grid-cols-2 gap-4">
			{props.map((cp: any, i: number) => {
				// Look up real snapshots by propId
				const realSnaps = cp.propId ? snapMap[String(cp.propId)] : undefined;
				const snapshots =
					realSnaps && realSnaps.length > 0
						? realSnaps.map((s: any) => ({
								timestamp: s.timestamp,
								line: s.line,
								snapshotType: s.snapshotType,
								edge: s.edge,
							}))
						: [
								// Fallback: single current snapshot (no random data)
								{
									timestamp: Date.now(),
									line: cp.line,
									snapshotType: "current",
									edge: cp.edge,
								},
							];

				return (
					<div key={i}>
						<div className="text-xs font-medium text-muted-foreground mb-2">
							{formatLabel(cp.statType)} — {formatLabel(cp.platform)} (
							{formatDirection(cp.overUnder)} {cp.line})
						</div>
						<LineMovementTimeline snapshots={snapshots} />
					</div>
				);
			})}
		</div>
	);
}

/* ═══════ Results History Tab ═══════ */
function ResultsHistoryTab({ profile }: { profile: any }) {
	const results = profile.resultHistory || [];
	if (!results.length) {
		return (
			<EmptyState
				icon={BarChart3}
				title="No result history"
				description="No graded pick results for this player"
			/>
		);
	}

	return (
		<div className="rounded-xl border border-white/5 bg-card/50 overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-xs">
					<thead>
						<tr className="border-b border-white/10 text-left text-[10px] text-muted-foreground/60 uppercase tracking-wider">
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Prop</th>
							<th className="px-4 py-3">Direction</th>
							<th className="px-4 py-3 text-right">Line</th>
							<th className="px-4 py-3 text-right">Actual</th>
							<th className="px-4 py-3 text-right">Margin</th>
							<th className="px-4 py-3 text-right">Edge</th>
							<th className="px-4 py-3">Platform</th>
						</tr>
					</thead>
					<tbody>
						{results.map((r: any, i: number) => {
							const actual =
								r.actualStat !== undefined
									? Math.max(0, r.actualStat)
									: undefined;
							// Direction-aware margin: positive = pick beat the line
							const margin =
								actual !== undefined
									? Math.round(
											(r.overUnder === "over"
												? actual - r.pickLine
												: r.pickLine - actual) * 10,
										) / 10
									: undefined;
							return (
								<tr
									key={i}
									className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
								>
									<td className="px-4 py-2.5">
										<span
											className={cn(
												"text-[10px] px-2 py-0.5 rounded-full font-semibold",
												r.resultStatus === "won"
													? "bg-emerald-500/10 text-emerald-400"
													: r.resultStatus === "lost"
														? "bg-red-500/10 text-red-400"
														: "bg-zinc-500/10 text-zinc-400",
											)}
										>
											{r.resultStatus.toUpperCase()}
										</span>
									</td>
									<td className="px-4 py-2.5 font-medium">
										{formatLabel(r.statType)}
									</td>
									<td className="px-4 py-2.5">
										<span
											className={cn(
												"text-[10px] font-semibold",
												r.overUnder === "over"
													? "text-emerald-400"
													: "text-red-400",
											)}
										>
											{formatDirection(r.overUnder)}
										</span>
									</td>
									<td className="px-4 py-2.5 text-right font-mono">
										{r.pickLine}
									</td>
									<td className="px-4 py-2.5 text-right font-mono font-medium">
										{actual ?? "—"}
									</td>
									<td className="px-4 py-2.5 text-right font-mono">
										{margin !== undefined ? (
											<span
												className={
													margin > 0
														? "text-emerald-400"
														: margin < 0
															? "text-red-400"
															: "text-muted-foreground"
												}
											>
												{margin > 0 ? "+" : ""}
												{margin.toFixed(1)}
											</span>
										) : (
											"—"
										)}
									</td>
									<td className="px-4 py-2.5 text-right">
										<EdgeBadge edge={r.pickEdge} size="xs" />
									</td>
									<td className="px-4 py-2.5 text-muted-foreground">
										{formatLabel(r.platform)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
