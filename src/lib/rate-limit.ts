interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitRule {
  windowMs: number;
  max: number;
}

function cleanup(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(key: string, rule: RateLimitRule): void {
  const now = Date.now();
  cleanup(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }
  existing.count += 1;
  if (existing.count > rule.max) {
    const retryIn = Math.ceil((existing.resetAt - now) / 1000);
    throw Object.assign(new Error(`Too many requests. Try again in ${retryIn}s.`), {
      rateLimited: true,
      retryAfterSeconds: retryIn,
    });
  }
}

export function resetRateLimits(): void {
  buckets.clear();
}
