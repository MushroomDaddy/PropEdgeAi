import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import propsRoutes from "./routes/props.js";
import picksRoutes from "./routes/picks.js";
import gamesRoutes from "./routes/games.js";
import resultsRoutes from "./routes/results.js";
import modelRoutes from "./routes/model.js";
import bankrollRoutes from "./routes/bankroll.js";
import settingsRoutes from "./routes/settings.js";
import chatRoutes from "./routes/chat.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import playersRoutes from "./routes/players.js";
import importsRoutes from "./routes/imports.js";
import adminRoutes from "./routes/admin.js";
import providersRoutes from "./routes/providers.js";
import usersRoutes from "./routes/users.js";

const app = new Hono();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("*", logger());

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.route("/api/props", propsRoutes);
app.route("/api/picks", picksRoutes);
app.route("/api/entries", picksRoutes); // entries sub-routes are in picks router
app.route("/api/games", gamesRoutes);
app.route("/api/results", resultsRoutes);
app.route("/api/model", modelRoutes);
app.route("/api/bankroll", bankrollRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/leaderboard", leaderboardRoutes);
app.route("/api/players", playersRoutes);
app.route("/api/imports", importsRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/providers", providersRoutes);
app.route("/api/users", usersRoutes);

// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const port = parseInt(process.env.PORT ?? "3001", 10);
console.log(`PropEdge backend starting on port ${port}`);

serve({ fetch: app.fetch, port });
