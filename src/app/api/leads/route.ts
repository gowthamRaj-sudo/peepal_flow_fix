import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { leadCreateSchema } from "@/lib/validation";
import { leadsService } from "@/server/leads.service";

export const runtime = "nodejs";

const bodyLimit = 64 * 1024;

export const POST = withApi(
  async ({ req }) => {
    const raw = await req.text();
    if (raw.length > bodyLimit) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    const json = JSON.parse(raw) as unknown;
    const input = leadCreateSchema.parse(json);

    const lead = await leadsService.create({
      ...input,
      email: input.email || undefined,
    });

    return NextResponse.json({ code: lead.code, id: lead.id }, { status: 201 });
  },
  {
    rateLimit: { windowMs: 60 * 60 * 1000, max: 6 },
    csrf: true,
  },
);
