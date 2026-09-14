import { NotificationChannel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { normalizeIndianPhone } from "@/lib/phone";
import type { MessageProvider } from "./provider";
import {
  ConsoleProvider,
  GenericHttpSmsProvider,
  MetaWhatsAppProvider,
  ResendEmailProvider,
} from "./providers";

function resolveProvider(channel: NotificationChannel): MessageProvider {
  switch (channel) {
    case "WHATSAPP":
      if (env.WHATSAPP_API_URL && env.WHATSAPP_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID) {
        return new MetaWhatsAppProvider(
          env.WHATSAPP_API_URL,
          env.WHATSAPP_API_TOKEN,
          env.WHATSAPP_PHONE_NUMBER_ID,
        );
      }
      return new ConsoleProvider();
    case "SMS":
      if (env.SMS_API_KEY) return new GenericHttpSmsProvider(env.SMS_API_KEY);
      return new ConsoleProvider();
    case "EMAIL":
      if (env.EMAIL_API_KEY) return new ResendEmailProvider(env.EMAIL_API_KEY);
      return new ConsoleProvider();
  }
}

export interface QueueMessageInput {
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  templateCode?: string;
  relatedType?: string;
  relatedId?: string;
  payload?: Record<string, unknown>;
}

export const notificationService = {
  async queue(input: QueueMessageInput) {
    return prisma.notification.create({
      data: {
        channel: input.channel,
        recipient: input.recipient,
        subject: input.subject ?? null,
        body: input.body,
        templateCode: input.templateCode ?? null,
        relatedType: input.relatedType ?? null,
        relatedId: input.relatedId ?? null,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
        status: "QUEUED",
      },
    });
  },

  async deliver(notificationId: string): Promise<boolean> {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.status === "SENT") return true;
    if (notification.attempts >= 3) return false;

    let recipient = notification.recipient;
    if (notification.channel !== "EMAIL") {
      const normalized = normalizeIndianPhone(recipient);
      if (!normalized) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { status: "FAILED", error: "Invalid phone number", attempts: { increment: 1 } },
        });
        return false;
      }
      recipient = normalized;
    }

    const provider = resolveProvider(notification.channel);
    await prisma.notification.update({
      where: { id: notificationId },
      data: { attempts: { increment: 1 } },
    });
    const result = await provider.send({
      to: recipient,
      subject: notification.subject ?? undefined,
      body: notification.body,
    });

    await prisma.notification.update({
      where: { id: notificationId },
      data: result.ok
        ? { status: "SENT", sentAt: new Date(), error: null }
        : { status: "FAILED", error: result.error?.slice(0, 500) },
    });

    if (!result.ok) {
      logger.warn("notification.delivery_failed", {
        notificationId,
        channel: notification.channel,
        error: result.error,
      });
    }
    return result.ok;
  },

  async sendAndRecord(input: QueueMessageInput): Promise<void> {
    const row = await this.queue(input);
    await this.deliver(row.id);
  },

  async retryQueued(limit = 25): Promise<number> {
    const pending = await prisma.notification.findMany({
      where: { status: { in: ["QUEUED", "FAILED"] }, attempts: { lt: 3 } },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    let sent = 0;
    for (const n of pending) {
      const ok = await this.deliver(n.id);
      if (ok) sent += 1;
    }
    return sent;
  },
};
