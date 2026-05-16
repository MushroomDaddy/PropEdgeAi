/**
 * PropEdge AI — Player/Team Asset System (R12)
 *
 * Provides premium fallback visuals when real headshots/logos
 * aren't available. No ugly blank boxes.
 *
 * Asset priority:
 *   1. Real URL from provider (SportsDataIO, Sportradar)
 *   2. Team-color-aware generated visual
 *   3. Premium silhouette / initials badge
 */

// ─── Comprehensive Team Color Database ───
export const TEAM_COLORS: Record<
	string,
	{ primary: string; secondary: string; accent: string }
> = {
	// NBA
	"Atlanta Hawks": {
		primary: "#E03A3E",
		secondary: "#C1D32F",
		accent: "#26282A",
	},
	"Boston Celtics": {
		primary: "#007A33",
		secondary: "#BA9653",
		accent: "#FFFFFF",
	},
	"Brooklyn Nets": {
		primary: "#000000",
		secondary: "#FFFFFF",
		accent: "#777D84",
	},
	"Charlotte Hornets": {
		primary: "#1D1160",
		secondary: "#00788C",
		accent: "#A1A1A4",
	},
	"Chicago Bulls": {
		primary: "#CE1141",
		secondary: "#000000",
		accent: "#FFFFFF",
	},
	"Cleveland Cavaliers": {
		primary: "#6F263D",
		secondary: "#FFB81C",
		accent: "#041E42",
	},
	"Dallas Mavericks": {
		primary: "#00538C",
		secondary: "#002B5E",
		accent: "#B8C4CA",
	},
	"Denver Nuggets": {
		primary: "#0E2240",
		secondary: "#FEC524",
		accent: "#8B2131",
	},
	"Detroit Pistons": {
		primary: "#C8102E",
		secondary: "#1D42BA",
		accent: "#BEC0C2",
	},
	"Golden State Warriors": {
		primary: "#1D428A",
		secondary: "#FFC72C",
		accent: "#26282A",
	},
	"Houston Rockets": {
		primary: "#CE1141",
		secondary: "#000000",
		accent: "#C4CED4",
	},
	"Indiana Pacers": {
		primary: "#002D62",
		secondary: "#FDBB30",
		accent: "#BEC0C2",
	},
	"LA Clippers": {
		primary: "#C8102E",
		secondary: "#1D428A",
		accent: "#BEC0C2",
	},
	"Los Angeles Lakers": {
		primary: "#552583",
		secondary: "#FDB927",
		accent: "#000000",
	},
	"Memphis Grizzlies": {
		primary: "#5D76A9",
		secondary: "#12173F",
		accent: "#F5B112",
	},
	"Miami Heat": { primary: "#98002E", secondary: "#F9A01B", accent: "#000000" },
	"Milwaukee Bucks": {
		primary: "#00471B",
		secondary: "#EEE1C6",
		accent: "#0077C0",
	},
	"Minnesota Timberwolves": {
		primary: "#0C2340",
		secondary: "#236192",
		accent: "#9EA2A2",
	},
	"New Orleans Pelicans": {
		primary: "#0C2340",
		secondary: "#C8102E",
		accent: "#85714D",
	},
	"New York Knicks": {
		primary: "#006BB6",
		secondary: "#F58426",
		accent: "#BEC0C2",
	},
	"Oklahoma City Thunder": {
		primary: "#007AC1",
		secondary: "#EF6100",
		accent: "#002D62",
	},
	"Orlando Magic": {
		primary: "#0077C0",
		secondary: "#C4CED4",
		accent: "#000000",
	},
	"Philadelphia 76ers": {
		primary: "#006BB6",
		secondary: "#ED174C",
		accent: "#002B5C",
	},
	"Phoenix Suns": {
		primary: "#1D1160",
		secondary: "#E56020",
		accent: "#000000",
	},
	"Portland Trail Blazers": {
		primary: "#E03A3E",
		secondary: "#000000",
		accent: "#FFFFFF",
	},
	"Sacramento Kings": {
		primary: "#5A2D81",
		secondary: "#63727A",
		accent: "#000000",
	},
	"San Antonio Spurs": {
		primary: "#C4CED4",
		secondary: "#000000",
		accent: "#FFFFFF",
	},
	"Toronto Raptors": {
		primary: "#CE1141",
		secondary: "#000000",
		accent: "#A1A1A4",
	},
	"Utah Jazz": { primary: "#002B5C", secondary: "#00471B", accent: "#F9A01B" },
	"Washington Wizards": {
		primary: "#002B5C",
		secondary: "#E31837",
		accent: "#C4CED4",
	},

	// NFL (abbreviated)
	"Kansas City Chiefs": {
		primary: "#E31837",
		secondary: "#FFB81C",
		accent: "#FFFFFF",
	},
	"Buffalo Bills": {
		primary: "#00338D",
		secondary: "#C60C30",
		accent: "#FFFFFF",
	},
	"San Francisco 49ers": {
		primary: "#AA0000",
		secondary: "#B3995D",
		accent: "#000000",
	},
	"Philadelphia Eagles": {
		primary: "#004C54",
		secondary: "#A5ACAF",
		accent: "#000000",
	},
	"Dallas Cowboys": {
		primary: "#003594",
		secondary: "#869397",
		accent: "#FFFFFF",
	},
	"Green Bay Packers": {
		primary: "#203731",
		secondary: "#FFB612",
		accent: "#FFFFFF",
	},
	"Baltimore Ravens": {
		primary: "#241773",
		secondary: "#9E7C0C",
		accent: "#000000",
	},
	"Cincinnati Bengals": {
		primary: "#FB4F14",
		secondary: "#000000",
		accent: "#FFFFFF",
	},
	"Detroit Lions": {
		primary: "#0076B6",
		secondary: "#B0B7BC",
		accent: "#000000",
	},
	"Miami Dolphins": {
		primary: "#008E97",
		secondary: "#FC4C02",
		accent: "#005778",
	},

	// MLB (abbreviated)
	"NY Yankees": { primary: "#003087", secondary: "#E4002C", accent: "#FFFFFF" },
	"LA Dodgers": { primary: "#005A9C", secondary: "#EF3E42", accent: "#A5ACAF" },
	"Atlanta Braves": {
		primary: "#CE1141",
		secondary: "#13274F",
		accent: "#EAAA00",
	},
	"Houston Astros": {
		primary: "#002D62",
		secondary: "#EB6E1F",
		accent: "#F4911E",
	},
	"Chicago Cubs": {
		primary: "#0E3386",
		secondary: "#CC3433",
		accent: "#FFFFFF",
	},
	"Boston Red Sox": {
		primary: "#BD3039",
		secondary: "#0C2340",
		accent: "#FFFFFF",
	},
};

/**
 * Get team colors with intelligent fallback
 */
export function getTeamColors(
	team: string,
	colorOverride?: string,
): {
	primary: string;
	secondary: string;
	accent: string;
} {
	// Check exact match
	if (TEAM_COLORS[team]) return TEAM_COLORS[team];

	// Partial match (e.g., "Lakers" → "Los Angeles Lakers")
	const lower = team.toLowerCase();
	for (const [key, val] of Object.entries(TEAM_COLORS)) {
		if (
			key.toLowerCase().includes(lower) ||
			lower.includes(key.toLowerCase().split(" ").pop()!)
		) {
			return val;
		}
	}

	// Use provided color override
	if (colorOverride) {
		return {
			primary: colorOverride,
			secondary: adjustBrightness(colorOverride, 30),
			accent: "#FFFFFF",
		};
	}

	// Generate consistent color from team name hash
	const hash = hashString(team);
	const hue = hash % 360;
	return {
		primary: `hsl(${hue}, 70%, 40%)`,
		secondary: `hsl(${(hue + 30) % 360}, 60%, 50%)`,
		accent: "#FFFFFF",
	};
}

/**
 * Get player initials from name
 */
export function getPlayerInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.filter(Boolean)
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

/**
 * Get team abbreviation for badges
 */
export function getTeamAbbr(team: string): string {
	// Common abbreviations
	const ABBR_MAP: Record<string, string> = {
		"Atlanta Hawks": "ATL",
		"Boston Celtics": "BOS",
		"Brooklyn Nets": "BKN",
		"Charlotte Hornets": "CHA",
		"Chicago Bulls": "CHI",
		"Cleveland Cavaliers": "CLE",
		"Dallas Mavericks": "DAL",
		"Denver Nuggets": "DEN",
		"Detroit Pistons": "DET",
		"Golden State Warriors": "GSW",
		"Houston Rockets": "HOU",
		"Indiana Pacers": "IND",
		"LA Clippers": "LAC",
		"Los Angeles Lakers": "LAL",
		"Memphis Grizzlies": "MEM",
		"Miami Heat": "MIA",
		"Milwaukee Bucks": "MIL",
		"Minnesota Timberwolves": "MIN",
		"New Orleans Pelicans": "NOP",
		"New York Knicks": "NYK",
		"Oklahoma City Thunder": "OKC",
		"Orlando Magic": "ORL",
		"Philadelphia 76ers": "PHI",
		"Phoenix Suns": "PHX",
		"Portland Trail Blazers": "POR",
		"Sacramento Kings": "SAC",
		"San Antonio Spurs": "SAS",
		"Toronto Raptors": "TOR",
		"Utah Jazz": "UTA",
		"Washington Wizards": "WAS",
		"Kansas City Chiefs": "KC",
		"Buffalo Bills": "BUF",
		"San Francisco 49ers": "SF",
		"NY Yankees": "NYY",
		"LA Dodgers": "LAD",
		"Atlanta Braves": "ATL",
	};

	if (ABBR_MAP[team]) return ABBR_MAP[team];

	// Fallback: take last word and abbreviate
	const words = team.split(" ");
	const last = words[words.length - 1];
	return last.substring(0, 3).toUpperCase();
}

/**
 * Generate a sport-specific icon emoji
 */
export function getSportIcon(sport: string): string {
	const icons: Record<string, string> = {
		NBA: "🏀",
		NFL: "🏈",
		MLB: "⚾",
		NHL: "🏒",
		NCAAB: "🏀",
		NCAAF: "🏈",
		MLS: "⚽",
		UFC: "🥊",
	};
	return icons[sport?.toUpperCase()] || "🎯";
}

// ─── Helpers ───

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

function adjustBrightness(hex: string, percent: number): string {
	const num = parseInt(hex.replace("#", ""), 16);
	const r = Math.min(255, ((num >> 16) & 0xff) + percent);
	const g = Math.min(255, ((num >> 8) & 0xff) + percent);
	const b = Math.min(255, (num & 0xff) + percent);
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
