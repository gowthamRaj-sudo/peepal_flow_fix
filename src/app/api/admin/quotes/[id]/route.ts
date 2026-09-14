import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { quotesService } from "@/server/quotes.service";
import { audit } from "@/server/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  action: z.enum(["SEND", "MARK_ACCEPTED", "MARK_REJECTED", "REGENERATE_PDF"]),
});

export const PATCH = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const { id } = await ctx.params;
    const { action } = patchSchema.parse(await req.json().catch(() => null));

    if (action === "SEND") {
      await quotesService.send(id);
    } else if (action === "MARK_ACCEPTED") {
      await prisma.quote.update({
        where: { id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });
    } else if (action === "MARK_REJECTED") {
      await prisma.quote.update({
        where: { id },
        data: { status: "REJECTED", rejectedAt: new Date() },
      });
    }

    await audit({ actorId: user!.id, action: `quote.${action.toLowerCase()}`, entityType: "QUOTE", entityId: id, ip });

    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN", "STAFF"] },
);
