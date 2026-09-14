import type { Job } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, forbidden, notFound } from "@/lib/errors";
import { nextCode } from "@/lib/codes";
import { notificationService } from "@/services/notifications";
import { getActiveTemplate, renderTemplate } from "@/services/templates";

export interface ScheduleJobInput {
  leadId?: string | null;
  customerId: string;
  serviceId: string;
  areaId?: string | null;
  title: string;
  address?: string;
  scheduledFor: Date;
  assignedToId?: string | null;
  notes?: string;
}

export const jobsService = {
  async schedule(input: ScheduleJobInput): Promise<Job> {
    const [customer, service] = await Promise.all([
      prisma.customer.findUnique({ where: { id: input.customerId }, select: { id: true } }),
      prisma.service.findUnique({ where: { id: input.serviceId }, select: { id: true } }),
    ]);
    if (!customer) throw badRequest("Customer not found");
    if (!service) throw badRequest("Service not found");

    const code = await nextCode("job");
    return prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          code,
          customerId: input.customerId,
          leadId: input.leadId ?? null,
          serviceId: input.serviceId,
          areaId: input.areaId ?? null,
          title: input.title,
          address: input.address ?? null,
          scheduledFor: input.scheduledFor,
          assignedToId: input.assignedToId ?? null,
          notes: input.notes ?? null,
        },
      });

      if (input.leadId) {
        const lead = await tx.lead.findUnique({ where: { id: input.leadId }, select: { status: true, areaId: true } });
        if (lead) {
          const allowed =
            lead.status === "NEW" ||
            lead.status === "CONTACTED" ||
            lead.status === "VISIT_SCHEDULED" ||
            lead.status === "QUOTATION_SENT" ||
            lead.status === "CUSTOMER_APPROVED";
          if (allowed && lead.status !== "JOB_SCHEDULED") {
            await tx.lead.update({
              where: { id: input.leadId },
              data: { status: "JOB_SCHEDULED" },
            });
          }
        }
      }

      return job;
    });
  },

  async getJobForRole(jobId: string, role: "ADMIN" | "STAFF" | "FIELD_WORKER", userId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: true,
        service: true,
        area: true,
        assignedTo: { select: { id: true, name: true, phone: true } },
        photos: { orderBy: { takenAt: "asc" as const } },
        quotes: { select: { id: true, code: true, status: true, total: true } },
      },
    });
    if (!job) throw notFound("Job not found");
    if (role === "FIELD_WORKER" && job.assignedToId !== userId) {
      throw forbidden("This job is not assigned to you");
    }
    return job;
  },

  async updateStatus(
    jobId: string,
    newStatus: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ): Promise<Job> {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw notFound("Job not found");

    const flow: Record<string, string[]> = {
      SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: ["SCHEDULED"],
    };
    if (!flow[job.status]?.includes(newStatus)) {
      throw badRequest(`Cannot move a job from ${job.status} to ${newStatus}`);
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: newStatus,
        startedAt: newStatus === "IN_PROGRESS" ? new Date() : undefined,
        completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
      },
      include: { customer: true, service: true },
    });

    // Sync the originating lead's status.
    if (updated.leadId) {
      const syncMap: Record<string, "IN_PROGRESS" | "COMPLETED"> = {
        IN_PROGRESS: "IN_PROGRESS",
        COMPLETED: "COMPLETED",
      };
      const target = syncMap[newStatus];
      if (target) {
        const lead = await prisma.lead.findUnique({
          where: { id: updated.leadId },
          select: { status: true },
        });
        if (
          lead &&
          ((target === "IN_PROGRESS" && lead.status === "JOB_SCHEDULED") ||
            (target === "COMPLETED" && lead.status !== "COMPLETED"))
        ) {
          await prisma.lead
            .update({ where: { id: updated.leadId }, data: { status: target } })
            .catch(() => undefined);
        }
      }
    }

    if (newStatus === "COMPLETED") {
      await this.onJobCompleted(updated);
    }

    return updated;
  },

  async onJobCompleted(job: Job & { customer: { name: string; whatsapp: string | null; phone: string }; service: { name: string } }): Promise<void> {
    const vars = {
      name: job.customer.name,
      service: job.service.name,
      code: job.code,
    };

    const completionTpl = job.customer.whatsapp || job.customer.phone
      ? await getActiveTemplate("JOB_COMPLETED_CUSTOMER")
      : null;
    if (completionTpl) {
      await notificationService.queue({
        channel: "WHATSAPP",
        recipient: job.customer.whatsapp ?? job.customer.phone,
        body: renderTemplate(completionTpl.body, vars),
        templateCode: completionTpl.code,
        relatedType: "JOB",
        relatedId: job.id,
      });
    }

    const delayDays = Number(process.env.REVIEW_REQUEST_DELAY_DAYS ?? "2");
    const existing = await prisma.reviewRequest.findUnique({ where: { jobId: job.id } });
    if (!existing && job.customer.whatsapp) {
      await prisma.reviewRequest.create({
        data: {
          jobId: job.id,
          customerId: job.customerId,
          scheduledFor: new Date(Date.now() + delayDays * 86400_000),
        },
      });
    }
  },
};
