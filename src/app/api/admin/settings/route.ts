import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { setSetting } from "@/server/settings";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

const schema = z.object({
  business_phone: z.string().trim().max(20).optional(),
  business_whatsapp: z.string().trim().max(20).optional(),
  business_email: z.string().trim().email().max(200).optional().or(z.literal("")),
  working_hours: z.string().trim().max(120).optional(),
  google_review_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  review_request_delay_days: z.coerce.number().int().min(0).max(30).optional(),
});

export const PUT = withApi(
  async ({ req, user, ip }) => {
    const data = schema.parse(await req.json());
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) await setSetting(key, String(value));
    }
    await audit({
      actorId: user!.id,
      action: "settings.updated",
      entityType: "SETTING",
      entityId: "business",
      meta: { keys: Object.keys(data) },
      ip,
    });
    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN"] },
);
