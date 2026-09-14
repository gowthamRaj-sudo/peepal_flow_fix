import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { badRequest } from "@/lib/errors";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

const createSchema = z.object({
  leadId: z.string().optional(),
  customerId: z.string(),
  serviceId: z.string(),
  areaId: z.string().optional().nullable(),
  title: z.string().trim().min(3).max(120),
  address: z.string().max(500).optional(),
  scheduledFor: z.string().datetime({ offset: true }),
  assignedToId: z.string().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

export const POST = withApi(
  async ({ req, user, ip }) => {
    const input = createSchema.parse(await req.json().catch(() => null));
    const { jobsService } = await import("@/server/jobs.service");

    const job = await jobsService.schedule({
      leadId: input.leadId ?? null,
      customerId: input.customerId,
      serviceId: input.serviceId,
      areaId: input.areaId ?? null,
      title: input.title,
      address: input.address,
      scheduledFor: new Date(input.scheduledFor),
      assignedToId: input.assignedToId ?? null,
      notes: input.notes,
    });

    await audit({
      actorId: user!.id,
      action: "job.created",
      entityType: "JOB",
      entityId: job.id,
      meta: { leadId: input.leadId },
      ip,
    });

    return NextResponse.json({ id: job.id, code: job.code }, { status: 201 });
  },
  { roles: ["ADMIN", "STAFF"] },
);
