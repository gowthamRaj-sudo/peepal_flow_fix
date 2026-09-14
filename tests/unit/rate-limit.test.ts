import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/rate-limit";

beforeEach(() => resetRateLimits());
afterEach(() => resetRateLimits());

function attempt(key: string, max: number) {
  try {
    checkRateLimit(key, { windowMs: 60_000, max });
    return true;
  } catch {
    return false;
  }
}

describe("checkRateLimit", () => {
  it("allows requests under the limit and blocks beyond it", () => {
    expect(attempt("k1", 3)).toBe(true);
    expect(attempt("k1", 3)).toBe(true);
    expect(attempt("k1", 3)).toBe(true);
    expect(attempt("k1", 3)).toBe(false);
  });

  it("attaches retryAfterSeconds when blocking", () => {
    checkRateLimit("k2", { windowMs: 60_000, max: 1 });
    try {
      checkRateLimit("k2", { windowMs: 60_000, max: 1 });
      expect.unreachable("should have thrown");
    } catch (e) {
      const err = e as Error & { retryAfterSeconds?: number };
      expect(err.retryAfterSeconds).toBeGreaterThan(0);
      expect(err.retryAfterSeconds).toBeLessThanOrEqual(60);
    }
  });

  it("tracks keys independently", () => {
    expect(attempt("a", 1)).toBe(true);
    expect(attempt("b", 1)).toBe(true);
    expect(attempt("a", 1)).toBe(false);
  });

  it("recovers after the window elapses", () => {
    vi.useFakeTimers();
    try {
      expect(attempt("t", 1)).toBe(true);
      vi.advanceTimersByTime(60_001);
      expect(attempt("t", 1)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
