/**
 * Lightweight in-memory rate limiter (per-process). Suitable for a single
 * node / dev. For multi-instance production, swap the Map for Redis.
 */
const buckets = new Map();

export function rateLimit({ key, limit = 10, windowMs = 60000 }) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, remaining: limit - entry.count };
}

/** Derive a client identifier from a Next request. */
export function clientKey(req, scope = "") {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  return `${scope}:${ip}`;
}
