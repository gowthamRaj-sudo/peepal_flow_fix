import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function audit(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
  ip?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        meta: (params.meta ?? {}) as object,
        ip: params.ip ?? null,
      },
    });
  } catch (e) {
    logger.error("audit.write_failed", { err: e, action: params.action });
  }
}
