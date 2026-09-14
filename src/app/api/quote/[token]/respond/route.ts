import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { quotesService } from "@/server/quotes.service";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ token: string }>;
}

const bodySchema = z.object({ action: z.enum(["ACCEPT", "REJECT"]) });

export const POST = withApi<RouteCtx>(
  async ({ req }, ctx) => {
    const { token } = await ctx.params;
    const { action } = bodySchema.parse(await req.json().catch(() => null));
    await quotesService.respond(token, action);
    return NextResponse.json({ ok: true });
  },
  {
    rateLimit: { windowMs: 60 * 60 * 1000, max: 20 },
    csrf: false,
  },
);
