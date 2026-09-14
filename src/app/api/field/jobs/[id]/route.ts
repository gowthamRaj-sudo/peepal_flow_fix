import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { jobsService } from "@/server/jobs.service";
import { audit } from "@/server/audit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().trim().max(3000).optional(),
});

/**
 * Field-worker endpoint. A FIELD_WORKER may only touch jobs assigned to them,
 * and only update status / append notes — never customer or financial data.
 */
export const PATCH = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json().catch(() => null));

    // Ownership check for field workers
    if (user!.role === "FIELD_WORKER") {
      const job = await prisma.job.findUnique({ where: { id }, select: { assignedToId: true } });
      if (!job || job.assignedToId !== user!.id) {
        return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
      }
    }

    if (body.notes?.trim()) {
      const job = await prisma.job.findUnique({ where: { id }, select: { notes: true } });
      if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
      const stamp = `\n[${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}] ${user!.name}: ${body.notes.trim()}`;
      await prisma.job.update({
        where: { id },
        data: { notes: `${job.notes ?? ""}${stamp}`.trimStart() },
      });
    }

    if (body.status) {
      await jobsService.updateStatus(id, body.status);
      await audit({
        actorId: user!.id,
        action: `job.${body.status.toLowerCase()}`,
        entityType: "JOB",
        entityId: id,
        meta: { via: "field_app" },
        ip,
      });

      if (body.status === "IN_PROGRESS" && user!.role === "FIELD_WORKER") {
        const { notificationService } = await import("@/services/notifications");
        const job = await prisma.job.findUnique({
          where: { id },
          include: {
            service: { select: { name: true } },
            customer: { select: { name: true, phone: true, whatsapp: true } },
          },
        });
        const tpl = job ? await import("@/services/templates").then((m) => m.getActiveTemplate("TECHNICIAN_ON_THE_WAY")) : null;
        if (job && tpl && (job.customer.whatsapp ?? job.customer.phone)) {
          await notificationService.queue({
            channel: "WHATSAPP",
            recipient: job.customer.whatsapp ?? job.customer.phone,
            body: tpl.body
              .replace("{{name}}", job.customer.name)
              .replace("{{service}}", job.service.name)
              .replace("{{time}}", new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })),
            templateCode: tpl.code,
            relatedType: "JOB",
            relatedId: job.id,
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN", "STAFF", "FIELD_WORKER"] },
);
