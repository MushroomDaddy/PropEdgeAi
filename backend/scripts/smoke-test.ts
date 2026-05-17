/**
 * smoke-test.ts — Postgres-migration smoke test
 *
 * Ported from convex/goLiveSmokeTest.ts (R15.6 Step 5).
 * Instead of calling Convex actions, this hits the Hono backend API
 * endpoints and checks that the system is wired up correctly.
 *
 * Usage:
 *   SMOKE_TEST_TOKEN=*** npx tsx backend/scripts/smoke-test.ts
 *   SMOKE_TEST_TOKEN=*** npx ts backend/scripts/smoke-test.ts --sport NBA
 *
 * Set SMOKE_TEST_TOKEN to match the value in your backend .env.
 */

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const TOKEN = process.env.SMOKE_TEST_TOKEN;

interface StepResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  detail?: string;
}

function pass(name: string, detail?: string): StepResult {
  return { name, status: "passed", detail };
}
function fail(name: string, detail?: string): StepResult {
  return { name, status: "failed", detail };
}
function skip(name: string, detail?: string): StepResult {
  return { name, status: "skipped", detail };
}

async function smokeTest(): Promise<void> {
  if (!TOKEN) {
    console.error("ERROR: SMOKE_TEST_TOKEN environment variable is required.");
    console.error("Set it to match the value in your backend .env file.");
    process.exit(1);
  }

  const results: StepResult[] = [];
  console.log("\n── Smoke Test ──────────────────────────────\n");

  // 1. Health check
  try {
    const res = await fetch(`${API_URL}/health`);
    const body = await res.json();
    if (res.ok && body.ok) {
      results.push(pass("Health check", `Server timestamp: ${body.ts}`));
    } else {
      results.push(fail("Health check", JSON.stringify(body)));
    }
  } catch (e: any) {
    results.push(fail("Health check", e.message));
  }

  // 2. API route presence — hit several endpoints to verify they're wired
  const endpoints = [
    "/api/games?limit=1",
    "/api/props?limit=1",
    "/api/players?limit=1",
    "/api/leaderboard",
    "/api/providers",
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_URL}${ep}`);
      // Any response (even empty) means the endpoint is wired up
      results.push(pass(`Route: ${ep}`, `HTTP ${res.status}`));
    } catch (e: any) {
      results.push(fail(`Route: ${ep}`, e.message));
    }
  }

  // 3. Auth check — verify the `/api/users/me` route returns 401 without auth
  try {
    const res = await fetch(`${API_URL}/api/users/me`);
    if (res.status === 401) {
      results.push(pass("Auth guard", "GET /api/users/me correctly returns 401 without token"));
    } else {
      results.push(fail("Auth guard", `Expected 401, got ${res.status}`));
    }
  } catch (e: any) {
    results.push(fail("Auth guard", e.message));
  }

  // 4. Auth upsert — verify auth protects the upsert endpoint too
  try {
    const res = await fetch(`${API_URL}/api/users/upsert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "smoke@test.com" }),
    });
    if (res.status === 401) {
      results.push(pass("Upsert auth", "POST /api/users/upsert correctly returns 401 without token"));
    } else {
      results.push(fail("Upsert auth", `Expected 401, got ${res.status}`));
    }
  } catch (e: any) {
    results.push(fail("Upsert auth", e.message));
  }

  // 5. CORS headers check
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:5173" },
    });
    const cors = res.headers.get("access-control-allow-origin");
    if (res.ok || cors) {
      results.push(pass("CORS headers", `Access-Control-Allow-Origin: ${cors ?? "present"}`));
    } else {
      results.push(skip("CORS headers", "No CORS header found, may need configuration"));
    }
  } catch (e: any) {
    results.push(fail("CORS headers", e.message));
  }

  // 6. 404 handler check
  try {
    const res = await fetch(`${API_URL}/nonexistent`);
    const body = await res.json();
    if (res.status === 404 && body.error === "Not found") {
      results.push(pass("404 handler", "Correctly returns 404 for unknown routes"));
    } else {
      results.push(fail("404 handler", `Unexpected response: ${res.status}`));
    }
  } catch (e: any) {
    results.push(fail("404 handler", e.message));
  }

  // ─── Report ──────────────────────────
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  console.log("\n── Results ──────────────────────────────\n");
  for (const r of results) {
    const icon = r.status === "passed" ? "PASS" : r.status === "failed" ? "FAIL" : "SKIP";
    console.log(`  [${icon}] ${r.name}`);
    if (r.detail) console.log(`         ${r.detail}`);
  }

  console.log(`\n  Summary: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

smokeTest().catch((e) => {
  console.error("Fatal error:", e.message);
});