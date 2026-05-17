import type { MiddlewareHandler } from "hono";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export const adminOnly: MiddlewareHandler = async (c, next) => {
  const auth = c.get("auth");
  if (!auth || !auth.email || !ADMIN_EMAILS.includes(auth.email)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
};
