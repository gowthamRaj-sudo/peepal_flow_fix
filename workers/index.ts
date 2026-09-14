import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { notificationService } from "@/services/notifications";
import { getActiveTemplate, renderTemplate } from "@/services/templates";

/**
 * Background maintenance tasks:
 * 1. Retry queued/failed notifications (speed-to-lead messages must not get lost).
 * 2. Send review requests for jobs completed REVIEW_REQUEST_DELAY_DAYS days ago
 *    (exactly once — ReviewRequest.sentAt marks completion).
 */
export async function processWorkers(): Promise<{
  notificationsSent: number;
  reviewRequestsSent: number;
}> {
  const notificationsSent = await notificationService.retryQueued(25);

  const delayDays = await prisma.setting
    .findUnique({ where: { key: "review_request_delay_days" } })
    .then((r) => Number(r?.value) || env.REVIEW_REQUEST_DELAY_DAYS)
    .catch(() => env.REVIEW_REQUEST_DELAY_DAYS);

  const dueBefore = new Date(Date.now() - delayDays * 86400_000);

  const due = await prisma.reviewRequest.findMany({
    where: { scheduledFor: { lte: dueBefore }, sentAt: null },
    take: 20,
    include: {
      customer: { select: { id: true, name: true, phone: true, whatsapp: true } },
      job: { select: { code: true, service: { select: { name: true } } } },
    },
  });

  let reviewRequestsSent = 0;
  for (const request of due) {
    const recipient = request.customer.whatsapp ?? request.customer.phone;
    if (!recipient) continue;

    const tpl = await getActiveTemplate("REVIEW_REQUEST_CUSTOMER");
    const body = tpl
      ? renderTemplate(tpl.body, {
          name: request.customer.name,
          service: request.job?.service.name ?? "service",
        })
      : `Hi ${request.customer.name}, thank you for choosing Peepal Flow Fix! If you were happy with our work, a Google review would mean a lot: ${env.GOOGLE_REVIEW_URL || ""}`;

    await notificationService.queue({
      channel: "WHATSAPP",
      recipient,
      subject: "Review request",
      body,
      templateCode: tpl?.code,
      relatedType: "JOB",
      relatedId: request.jobId ?? undefined,
    });
    await prisma.reviewRequest.update({
      where: { id: request.id },
      data: { sentAt: new Date() },
    });
    reviewRequestsSent += 1;
  }

  logger.info("workers.processed", { notificationsSent, reviewRequestsSent });
  return { notificationsSent, reviewRequestsSent };
}
