import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const eventSchema = z.object({
  name: z.string().min(1).max(64),
  path: z.string().max(300).optional(),
  sessionId: z.string().max(64).optional(),
});

const EVENT_NAMES = new Set([
  "click_to_call",
  "whatsapp_click",
  "request_service_click",
  "sticky_call",
  "sticky_whatsapp",
  "sticky_request",
  "lead_submitted",
  "quote_viewed",
  "page_view",
]);

export const POST = withApi(
  async ({ req }) => {
    const body = eventSchema.parse(await req.json().catch(() => null));
    if (!EVENT_NAMES.has(body.name)) {
      return NextResponse.json({ ok: true });
    }
    await prisma.eventLog.create({
      data: {
        name: body.name,
        path: body.path ?? null,
        sessionId: body.sessionId ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  },
  { rateLimit: { windowMs: 60 * 1000, max: 60 }, csrf: false },
);
