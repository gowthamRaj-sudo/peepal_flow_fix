import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/errors";
import { LeadStatus, Prisma } from "@prisma/client";
import { canTransitionLead } from "@/domain/lead-status";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  assignedToId: z.string().nullable().optional(),
  visitAt: z.string().datetime({ offset: true }).nullable().optional(),
  internalNotes: z.string().max(4000).optional(),
});

export const PATCH = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json().catch(() => null));

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) throw badRequest("Lead not found");

    const data: Prisma.LeadUpdateInput = {};

    if (body.status && body.status !== lead.status) {
      if (!canTransitionLead(lead.status, body.status)) {
        throw badRequest(`Cannot move a lead from ${lead.status} to ${body.status}`);
      }
      data.status = body.status;
      if (body.status === "CONTACTED" && !lead.firstContactedAt) {
        data.firstContactedAt = new Date();
      }
    }

    if (body.assignedToId !== undefined) {
      data.assignedTo =
        body.assignedToId === null ? { disconnect: true } : { connect: { id: body.assignedToId } };
    }
    if (body.visitAt !== undefined) {
      data.visitAt = body.visitAt ? new Date(body.visitAt) : null;
    }
    if (body.internalNotes !== undefined) {
      data.internalNotes = body.internalNotes;
    }

    if (Object.keys(data).length === 0) throw badRequest("Nothing to update");

    const updated = await prisma.lead.update({ where: { id }, data });

    await audit({
      actorId: user!.id,
      action: "lead.updated",
      entityType: "LEAD",
      entityId: lead.id,
      meta: { statusFrom: lead.status, statusTo: updated.status },
      ip,
    });

    return NextResponse.json({ ok: true, status: updated.status });
  },
  { roles: ["ADMIN", "STAFF"] },
);

export const GET = withApi<RouteCtx>(
  async (_ctx, route) => {
    void _ctx;
    const { id } = await (route as RouteCtx).params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) throw badRequest("Lead not found");
    return NextResponse.json({ lead });
  },
  { roles: ["ADMIN", "STAFF"] },
);
