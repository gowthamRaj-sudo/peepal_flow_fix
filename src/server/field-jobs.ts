import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const fieldJobsSelect = {
  id: true,
  code: true,
  title: true,
  status: true,
  scheduledFor: true,
  address: true,
  notes: true,
  customer: { select: { name: true, phone: true, whatsapp: true } },
  service: { select: { name: true, slug: true } },
  area: { select: { name: true } },
  _count: { select: { photos: true } },
} satisfies Prisma.JobSelect;

export type FieldJob = Prisma.JobGetPayload<{ select: typeof fieldJobsSelect }>;

export async function getJobsForWorker(
  workerId: string,
  opts: { todayOnly?: boolean; status?: string[] },
): Promise<FieldJob[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  const where: Prisma.JobWhereInput = {
    assignedToId: workerId,
    ...(opts.status ? { status: { in: opts.status as ("SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED")[] } } : {}),
    ...(opts.todayOnly
      ? { scheduledFor: { gte: startOfDay, lte: endOfDay } }
      : {}),
  };

  return prisma.job.findMany({
    where,
    orderBy: { scheduledFor: "asc" },
    take: 30,
    select: fieldJobsSelect,
  });
}
