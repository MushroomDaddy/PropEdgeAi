import {
	AlertTriangle,
	Ban,
	CheckCircle2,
	Clock,
	Flame,
	MinusCircle,
	Snowflake,
	TrendingDown,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════ Result Status Badge ═══════ */
const STATUS_CONFIG = {
	won: {
		icon: CheckCircle2,
		bg: "bg-emerald-500/10",
		text: "text-emerald-400",
		border: "border-emerald-500/20",
		label: "WON",
	},
	lost: {
		icon: XCircle,
		bg: "bg-red-500/10",
		text: "text-red-400",
		border: "border-red-500/20",
		label: "LOST",
	},
	push: {
		icon: MinusCircle,
		bg: "bg-amber-500/10",
		text: "text-amber-400",
		border: "border-amber-500/20",
		label: "PUSH",
	},
	void: {
		icon: Ban,
		bg: "bg-zinc-500/10",
		text: "text-zinc-400",
		border: "border-zinc-500/20",
		label: "VOID",
	},
	pending: {
		icon: Clock,
		bg: "bg-blue-500/10",
		text: "text-blue-400",
		border: "border-blue-500/20",
		label: "PENDING",
	},
} as const;

export function ResultStatusBadge({
	status,
	size = "sm",
}: {
	status: string;
	size?: "xs" | "sm" | "md";
}) {
	const cfg =
		STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
		STATUS_CONFIG.pending;
	const Icon = cfg.icon;
	const sizeClasses =
		size === "xs"
			? "text-[10px] px-1.5 py-0.5 gap-0.5"
			: size === "md"
				? "text-sm px-3 py-1.5 gap-1.5"
				: "text-xs px-2 py-1 gap-1";
	const iconSize =
		size === "xs" ? "size-2.5" : size === "md" ? "size-4" : "size-3";
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full font-semibold border",
				cfg.bg,
				cfg.text,
				cfg.border,
				sizeClasses,
			)}
		>
			<Icon className={iconSize} />
			{cfg.label}
		</span>
	);
}

/* ═══════ Edge Badge ═══════ */
export function EdgeBadge({
	edge,
	size = "sm",
}: {
	edge: number;
	size?: "xs" | "sm";
}) {
	const isPositive = edge > 0;
	const sizeClasses =
		size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
	return (
		<span
			className={cn(
				"inline-flex items-center gap-0.5 rounded-md font-mono font-semibold",
				isPositive
					? "bg-emerald-500/10 text-emerald-400"
					: "bg-red-500/10 text-red-400",
				sizeClasses,
			)}
		>
			{isPositive ? (
				<TrendingUp className="size-3" />
			) : (
				<TrendingDown className="size-3" />
			)}
			{isPositive ? "+" : ""}
			{edge.toFixed(1)}%
		</span>
	);
}

/* ═══════ Value Score Badge ═══════ */
export function ValueScoreBadge({
	score,
	size = "sm",
}: {
	score: number;
	size?: "xs" | "sm" | "md";
}) {
	const color =
		score >= 80
			? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
			: score >= 60
				? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
				: score >= 40
					? "text-amber-400 border-amber-500/30 bg-amber-500/10"
					: "text-zinc-400 border-zinc-500/30 bg-zinc-500/10";
	const sizeClasses =
		size === "xs"
			? "text-[10px] size-6"
			: size === "md"
				? "text-base size-10"
				: "text-xs size-8";
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center rounded-lg font-bold border",
				color,
				sizeClasses,
			)}
		>
			{score}
		</span>
	);
}

/* ═══════ Data Source Badge ═══════ */
export function DataSourceBadge({ source = "demo" }: { source?: string }) {
	const configs: Record<
		string,
		{ bg: string; text: string; border: string; label: string; dot?: boolean }
	> = {
		live: {
			bg: "bg-emerald-500/10",
			text: "text-emerald-400",
			border: "border-emerald-500/20",
			label: "LIVE",
			dot: true,
		},
		api_sports: {
			bg: "bg-purple-500/10",
			text: "text-purple-400",
			border: "border-purple-500/20",
			label: "API-SPORTS",
		},
		the_odds_api: {
			bg: "bg-cyan-500/10",
			text: "text-cyan-400",
			border: "border-cyan-500/20",
			label: "ODDS API",
		},
		thesportsdb: {
			bg: "bg-pink-500/10",
			text: "text-pink-400",
			border: "border-pink-500/20",
			label: "SportsDB",
		},
		balldontlie: {
			bg: "bg-orange-500/10",
			text: "text-orange-400",
			border: "border-orange-500/20",
			label: "BDL",
		},
		manual: {
			bg: "bg-blue-500/10",
			text: "text-blue-400",
			border: "border-blue-500/20",
			label: "MANUAL",
		},
		demo: {
			bg: "bg-amber-500/10",
			text: "text-amber-400",
			border: "border-amber-500/20",
			label: "DEMO",
		},
	};
	const c = configs[source] || configs.demo;
	return (
		<span
			className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border} font-medium`}
		>
			{c.dot ? (
				<span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
			) : null}
			{!c.dot && source === "demo" ? (
				<AlertTriangle className="size-2.5" />
			) : null}
			{c.label}
		</span>
	);
}

/* ═══════ Confidence Badge ═══════ */
export function ConfidenceBadge({ confidence }: { confidence: number }) {
	const color =
		confidence >= 75
			? "text-emerald-400"
			: confidence >= 55
				? "text-cyan-400"
				: "text-amber-400";
	return (
		<span className={cn("text-xs font-mono font-semibold", color)}>
			{confidence}%
		</span>
	);
}

/* ═══════ Risk Label ═══════ */
export function RiskLabel({ bustRisk }: { bustRisk?: number }) {
	if (bustRisk === undefined) return null;
	const label =
		bustRisk >= 50 ? "High Risk" : bustRisk >= 25 ? "Medium" : "Low Risk";
	const color =
		bustRisk >= 50
			? "text-red-400 bg-red-500/10"
			: bustRisk >= 25
				? "text-amber-400 bg-amber-500/10"
				: "text-emerald-400 bg-emerald-500/10";
	return (
		<span
			className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", color)}
		>
			{label}
		</span>
	);
}

/* ═══════ Streak Badge ═══════ */
export function StreakBadge({ type, games }: { type: string; games: number }) {
	if (type === "hot") {
		return (
			<span className="inline-flex items-center gap-0.5 text-[10px] text-orange-400">
				<Flame className="size-3" /> {games}G streak
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-0.5 text-[10px] text-blue-400">
			<Snowflake className="size-3" /> {games}G cold
		</span>
	);
}

/* ═══════ Over/Under Direction Badge ═══════ */
export function DirectionBadge({
	direction,
	line,
}: {
	direction: string;
	line: number;
}) {
	const isOver = direction === "over";
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md",
				isOver
					? "bg-emerald-500/10 text-emerald-400"
					: "bg-red-500/10 text-red-400",
			)}
		>
			{isOver ? (
				<TrendingUp className="size-3" />
			) : (
				<TrendingDown className="size-3" />
			)}
			{direction.toUpperCase()} {line}
		</span>
	);
}
