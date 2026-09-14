import type { NotificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function renderTemplate(body: string, vars: Record<string, string | number>): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => {
    const value = vars[key];
    return value === undefined ? `{{${key}}}` : String(value);
  });
}

export interface TemplateContext {
  code: string;
  channel: NotificationChannel;
}

export async function getActiveTemplate(code: string) {
  return prisma.messageTemplate.findFirst({
    where: { code, isActive: true },
  });
}
