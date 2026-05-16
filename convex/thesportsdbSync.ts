/**
 * TheSportsDB Media Sync — R15.7 Stub
 *
 * Free tier: https://www.thesportsdb.com/api/v1/json/{key}/
 * Covers: team logos, player headshots, league badges, fanart, jersey images.
 *
 * NOTE: This is a stub. Real sync requires implementing:
 * - fetchTeamLogo(teamName: string): Promise<string | null>
 * - fetchPlayerHeadshot(playerName: string): Promise<string | null>
 * - syncAllTeams(sport: string): Promise<number>
 *
 * For now, all functions return { ok: false, error: { code: "not_implemented" } }
 */

export interface TheSportsDBSyncResult {
  ok: boolean;
  error?: { code: string; message?: string };
  synced?: number;
}

export async function syncTeamMedia(
  _teamId: string,
  _sport: string
): Promise<TheSportsDBSyncResult> {
  return { ok: false, error: { code: "not_implemented" } };
}

export async function syncPlayerMedia(
  _playerId: string,
  _sport: string
): Promise<TheSportsDBSyncResult> {
  return { ok: false, error: { code: "not_implemented" } };
}

export async function syncLeagueMedia(
  _leagueId: string,
  _sport: string
): Promise<TheSportsDBSyncResult> {
  return { ok: false, error: { code: "not_implemented" } };
}

export function getStatus(): { configured: boolean; message: string } {
  return {
    configured: false,
    message: "TheSportsDB sync not implemented yet. Set THESPORTSDB_API_KEY in Convex env to enable."
  };
}
