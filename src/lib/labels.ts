/**
 * PropEdge AI — Label Formatting Utilities (R12)
 *
 * Converts raw code labels (snake_case, camelCase) into clean
 * display-friendly labels. No raw code strings should appear in the UI.
 */

// Explicit overrides for known labels
const LABEL_MAP: Record<string, string> = {
  // Prop types
  over_under: "Over / Under",
  first_scorer: "First Scorer",
  player_special: "Player Special",
  alt_line: "Alt Line",
  moneyline: "Moneyline",
  spread: "Spread",
  total: "Total",
  player_props: "Player Props",
  h2h: "Head to Head",
  totals: "Totals",
  spreads: "Spreads",
  game_totals: "Game Totals",
  event_contracts: "Event Contracts",
  player_stats: "Player Stats",
  projections: "Projections",
  injuries: "Injuries",
  game_scores: "Game Scores",

  // Stat types
  points: "Points",
  rebounds: "Rebounds",
  assists: "Assists",
  threePointers: "3-Pointers",
  three_pointers: "3-Pointers",
  steals: "Steals",
  blocks: "Blocks",
  turnovers: "Turnovers",
  minutes: "Minutes",
  pts_reb_ast: "PTS+REB+AST",
  double_double: "Double-Double",
  triple_double: "Triple-Double",
  strikeouts: "Strikeouts",
  home_runs: "Home Runs",
  total_bases: "Total Bases",
  hits_allowed: "Hits Allowed",
  passing_yards: "Passing Yards",
  rushing_yards: "Rushing Yards",
  receiving_yards: "Receiving Yards",
  touchdowns: "Touchdowns",
  interceptions: "Interceptions",
  completions: "Completions",
  receptions: "Receptions",
  fantasy_score: "Fantasy Score",
  fantasy_points: "Fantasy Points",

  // Directions
  over: "Over",
  under: "Under",

  // Sports
  NBA: "NBA",
  NFL: "NFL",
  MLB: "MLB",
  NHL: "NHL",
  NCAAB: "NCAAB",
  NCAAF: "NCAAF",
  MLS: "MLS",

  // Platforms
  draftkings: "DraftKings",
  fanduel: "FanDuel",
  betmgm: "BetMGM",
  caesars: "Caesars",
  pointsbet: "PointsBet",
  kalshi: "Kalshi",
  prizepicks: "PrizePicks",
  underdog: "Underdog Fantasy",

  // Statuses
  fresh: "Fresh",
  stale: "Stale",
  updating: "Updating",
  live: "Live",
  upcoming: "Upcoming",
  final: "Final",
  demo: "Demo",
  hybrid: "Hybrid",

  // Providers
  the_odds_api: "The Odds API",
  sportsdata_io: "SportsData.io",
};

/**
 * Format any label into a clean display string.
 *
 * Priority:
 *   1. Exact match in LABEL_MAP
 *   2. Case-insensitive match in LABEL_MAP
 *   3. Auto-format: split on _ and camelCase, capitalize each word
 */
export function formatLabel(raw: string | undefined | null): string {
  if (!raw) return "—";

  // 1. Exact match
  if (LABEL_MAP[raw]) return LABEL_MAP[raw];

  // 2. Case-insensitive match
  const lower = raw.toLowerCase();
  for (const [key, val] of Object.entries(LABEL_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }

  // 3. Auto-format: handle snake_case, camelCase, kebab-case
  return (
    raw
      // Insert space before uppercase letters (camelCase → camel Case)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Replace underscores and hyphens with spaces
      .replace(/[_-]/g, " ")
      // Capitalize first letter of each word
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim()
  );
}

/**
 * Format direction (over/under) with color awareness
 */
export function formatDirection(direction: string | undefined | null): string {
  if (!direction) return "—";
  const d = direction.toLowerCase();
  if (d === "over" || d === "o") return "Over";
  if (d === "under" || d === "u") return "Under";
  return formatLabel(direction);
}

/**
 * Check if a label is snake_case or contains underscores
 */
export function isRawLabel(label: string): boolean {
  return /_/.test(label) || (/[a-z][A-Z]/.test(label) && !label.includes(" "));
}
