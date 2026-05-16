/**
 * PropEdge AI — API-SPORTS HTTP Client (R13)
 *
 * Handles HTTP requests to API-SPORTS endpoints with error handling and rate limiting
 */

export interface ApiSportsResult<T> {
  ok: boolean;
  data: T[];
  requestsUsed: number;
  requestsRemaining: number;
  error?: {
    code: string;
    message: string;
  };
}

const API_SPORTS_KEY = process.env.API_SPORTS_KEY || "";

export function isApiSportsConfigured(): boolean {
  return !!API_SPORTS_KEY;
}

export async function apiSportsFetch<T>(
  baseUrl: string,
  endpoint: string,
  params: Record<string, string | number> = {},
): Promise<ApiSportsResult<T>> {
  if (!isApiSportsConfigured()) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: {
        code: "not_configured",
        message: "API_SPORTS_KEY not configured",
      },
    };
  }

  try {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce(
        (acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>,
      ),
    ).toString();

    const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": API_SPORTS_KEY,
        "Content-Type": "application/json",
      },
    });

    const requestsUsed = parseInt(
      response.headers.get("x-apisports-requests-current") || "0",
    );
    const requestsRemaining = parseInt(
      response.headers.get("x-apisports-requests-limit-remaining") || "0",
    );

    if (!response.ok) {
      return {
        ok: false,
        data: [],
        requestsUsed,
        requestsRemaining,
        error: {
          code: "api_error",
          message: `API error: ${response.status} ${response.statusText}`,
        },
      };
    }

    const json = await response.json();
    const responseData = json.response || json.data || [];

    return {
      ok: true,
      data: Array.isArray(responseData) ? responseData : [responseData],
      requestsUsed,
      requestsRemaining,
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      requestsUsed: 0,
      requestsRemaining: 0,
      error: {
        code: "fetch_error",
        message: `Fetch error: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}
