/**
 * PropEdge AI — Central Grading Engine
 *
 * Handles grading for standard over/under props, Kalshi binary contracts,
 * quality flags, and full grading with metadata.
 */

/** Grade a standard over/under prop */
export function gradePick(args: {
	actualStat: number | undefined | null;
	pickLine: number;
	overUnder: string;
}): "won" | "lost" | "push" | "pending" {
	const { actualStat, pickLine, overUnder } = args;
	if (actualStat === undefined || actualStat === null) return "pending";
	if (actualStat === pickLine) return "push";
	if (overUnder === "over") return actualStat > pickLine ? "won" : "lost";
	return actualStat < pickLine ? "won" : "lost";
}

/** Grade a Kalshi binary contract */
export function gradeKalshi(args: {
	settlementStatus: string; // "settled_yes" | "settled_no" | "voided" | "open"
	side: string; // "yes" | "no"
}): "won" | "lost" | "void" | "pending" {
	const { settlementStatus, side } = args;
	if (settlementStatus === "voided") return "void";
	if (settlementStatus === "open") return "pending";
	const settledYes = settlementStatus === "settled_yes";
	if ((side === "yes" && settledYes) || (side === "no" && !settledYes))
		return "won";
	return "lost";
}

/** Quality flags for a graded pick */
export type QualityFlag =
	| "clean"
	| "injury_affected"
	| "blowout"
	| "overtime"
	| "shortened"
	| "dnp"
	| "low_minutes"
	| "ejected"
	| "rain_delay"
	| "stat_correction"
	| "garbage_time";

/** Detect quality flags based on context */
export function detectQualityFlags(args: {
	minutesPlayed?: number;
	expectedMinutes?: number;
	gameBlowout?: boolean;
	overtime?: boolean;
	gameShortenedOrSuspended?: boolean;
	playerDNP?: boolean;
	playerEjected?: boolean;
}): QualityFlag[] {
	const flags: QualityFlag[] = [];

	if (args.playerDNP) {
		flags.push("dnp");
		return flags;
	}
	if (args.playerEjected) flags.push("ejected");
	if (args.gameShortenedOrSuspended) flags.push("shortened");
	if (args.overtime) flags.push("overtime");
	if (args.gameBlowout) flags.push("blowout");

	if (
		args.minutesPlayed !== undefined &&
		args.expectedMinutes !== undefined &&
		args.minutesPlayed < args.expectedMinutes * 0.6
	) {
		flags.push("low_minutes");
	}

	if (flags.length === 0) flags.push("clean");
	return flags;
}

/** Full grading with all metadata */
export function fullGrade(args: {
	actualStat?: number | null;
	pickLine: number;
	overUnder: string;
	closingLine?: number;
	pickOdds?: number;
	modelVersion?: string;
	gradingSource?: string;
	minutesPlayed?: number;
	expectedMinutes?: number;
	gameBlowout?: boolean;
	overtime?: boolean;
	gameShortenedOrSuspended?: boolean;
	playerDNP?: boolean;
	playerEjected?: boolean;
}): {
	resultStatus: string;
	margin: number | null;
	clv: number | null;
	roi: number | null;
	qualityFlags: QualityFlag[];
	gradingSource: string;
	modelVersion: string;
	dataSource: string;
} {
	const status = gradePick({
		actualStat: args.actualStat,
		pickLine: args.pickLine,
		overUnder: args.overUnder,
	});

	const margin =
		args.actualStat !== undefined && args.actualStat !== null
			? args.overUnder === "over"
				? Math.round((args.actualStat - args.pickLine) * 10) / 10
				: Math.round((args.pickLine - args.actualStat) * 10) / 10
			: null;

	const clv =
		args.closingLine !== undefined
			? args.overUnder === "over"
				? Math.round((args.closingLine - args.pickLine) * 10) / 10
				: Math.round((args.pickLine - args.closingLine) * 10) / 10
			: null;

	// ROI: simplified — win at standard odds = ~90.9% return; loss = -100%
	const roi = status === "won" ? 90.9 : status === "lost" ? -100 : null;

	const qualityFlags = detectQualityFlags({
		minutesPlayed: args.minutesPlayed,
		expectedMinutes: args.expectedMinutes,
		gameBlowout: args.gameBlowout,
		overtime: args.overtime,
		gameShortenedOrSuspended: args.gameShortenedOrSuspended,
		playerDNP: args.playerDNP,
		playerEjected: args.playerEjected,
	});

	return {
		resultStatus: status,
		margin,
		clv,
		roi,
		qualityFlags,
		gradingSource: args.gradingSource ?? "auto",
		modelVersion: args.modelVersion ?? "heuristic-v1",
		dataSource: "demo",
	};
}
