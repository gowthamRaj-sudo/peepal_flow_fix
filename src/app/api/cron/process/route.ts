import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { forbidden } from "@/lib/errors";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Cron entry point (Vercel cron / system crontab every 5 min):
 *   curl -X POST https://site/api/cron/process -H "x-cron-secret: $CRON_SECRET"
 */
export const POST = withApi(
  async ({ req }) => {
    const secret = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
    if (!env.CRON_SECRET || secret !== env.CRON_SECRET) throw forbidden("Invalid cron secret");

    const { processWorkers } = await import("../../../../../workers/index");
    const result = await processWorkers();
    return NextResponse.json({ ok: true, ...result });
  },
  {
    rateLimit: { windowMs: 60_000, max: 10 },
    csrf: false,
  },
);
