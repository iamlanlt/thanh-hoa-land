type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanupAt = 0;

function cleanup(now: number) {
  if (buckets.size <= MAX_BUCKETS && now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanupAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size <= MAX_BUCKETS) return;
  const oldest = [...buckets.entries()]
    .sort(([, a], [, b]) => a.resetAt - b.resetAt)
    .slice(0, buckets.size - MAX_BUCKETS);
  for (const [key] of oldest) buckets.delete(key);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  cleanup(now);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }
  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return {
    allowed: true,
    remaining: limit - current.count,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
