import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/errors";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  assignedToId: z.string().nullable().optional(),
  notes: z.string().max(3000).optional(),
  scheduledFor: z.string().datetime({ offset: true }).optional(),
});

export const PATCH = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json().catch(() => null));

    const { jobsService } = await import("@/server/jobs.service");

    if (body.assignedToId !== undefined) {
      await prisma.job.update({
        where: { id },
        data: {
          assignedToId:
            body.assignedToId === null ? null : body.assignedToId,
        },
      });
      await audit({ actorId: user!.id, action: "job.assigned", entityType: "JOB", entityId: id, ip });
    }

    if (body.notes !== undefined && body.notes.trim()) {
      const job = await prisma.job.findUnique({ where: { id }, select: { notes: true } });
      if (!job) throw badRequest("Job not found");
      const stamp = `\n[${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}] ${user!.name}: ${body.notes.trim()}`;
      await prisma.job.update({
        where: { id },
        data: { notes: `${job.notes ?? ""}${stamp}`.trimStart() },
      });
    }

    if (body.scheduledFor) {
      await prisma.job.update({
        where: { id },
        data: { scheduledFor: new Date(body.scheduledFor) },
      });
    }

    if (body.status) {
      await jobsService.updateStatus(id, body.status);
      await audit({
        actorId: user!.id,
        action: `job.${body.status.toLowerCase()}`,
        entityType: "JOB",
        entityId: id,
        ip,
      });
    }

    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN", "STAFF"] },
);
