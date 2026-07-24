import { createHash } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

type LocalBucket = { count: number; resetAt: number };

const localBuckets = new Map<string, LocalBucket>();
const MAX_LOCAL_BUCKETS = 10_000;
const CLEANUP_INTERVAL_MS = 60_000;
const TRANSACTION_RETRIES = 3;
let lastLocalCleanupAt = 0;
let lastDatabaseCleanupAt = 0;

function cleanupLocalBuckets(now: number) {
  if (
    localBuckets.size <= MAX_LOCAL_BUCKETS &&
    now - lastLocalCleanupAt < CLEANUP_INTERVAL_MS
  ) {
    return;
  }
  lastLocalCleanupAt = now;
  for (const [key, bucket] of localBuckets) {
    if (bucket.resetAt <= now) localBuckets.delete(key);
  }
  if (localBuckets.size <= MAX_LOCAL_BUCKETS) return;
  const oldest = [...localBuckets.entries()]
    .sort(([, a], [, b]) => a.resetAt - b.resetAt)
    .slice(0, localBuckets.size - MAX_LOCAL_BUCKETS);
  for (const [key] of oldest) localBuckets.delete(key);
}

export function checkInMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  cleanupLocalBuckets(now);
  const current = localBuckets.get(key);
  if (!current || current.resetAt <= now) {
    localBuckets.set(key, { count: 1, resetAt: now + windowMs });
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

function hashBucketKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

function isRetryableTransactionError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2034" || error.code === "P2002")
  );
}

async function cleanupDatabaseBuckets(now: Date) {
  const nowMs = now.getTime();
  if (nowMs - lastDatabaseCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastDatabaseCleanupAt = nowMs;
  await prisma.rateLimitBucket
    .deleteMany({ where: { resetAt: { lte: now } } })
    .catch(() => undefined);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!Number.isInteger(limit) || limit < 1 || windowMs < 1) {
    throw new Error("Rate limit configuration is invalid.");
  }

  if (!isDatabaseConfigured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database-backed rate limiting is unavailable.");
    }
    return checkInMemoryRateLimit(key, limit, windowMs);
  }

  const hashedKey = hashBucketKey(key);
  for (let attempt = 0; attempt < TRANSACTION_RETRIES; attempt += 1) {
    const now = new Date();
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const current = await tx.rateLimitBucket.findUnique({
            where: { key: hashedKey },
          });
          if (!current || current.resetAt <= now) {
            const resetAt = new Date(now.getTime() + windowMs);
            await tx.rateLimitBucket.upsert({
              where: { key: hashedKey },
              update: { count: 1, resetAt },
              create: { key: hashedKey, count: 1, resetAt },
            });
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
              retryAfter: Math.max(
                1,
                Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000),
              ),
            };
          }
          const updated = await tx.rateLimitBucket.update({
            where: { key: hashedKey },
            data: { count: { increment: 1 } },
          });
          return {
            allowed: true,
            remaining: Math.max(0, limit - updated.count),
            retryAfter: Math.max(
              1,
              Math.ceil((updated.resetAt.getTime() - now.getTime()) / 1000),
            ),
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      void cleanupDatabaseBuckets(now);
      return result;
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === TRANSACTION_RETRIES - 1) {
        throw error;
      }
    }
  }
  throw new Error("Rate limit transaction failed.");
}
