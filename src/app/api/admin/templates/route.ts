import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/errors";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(2).max(80),
  body: z.string().trim().min(1).max(2000),
});

export const PUT = withApi(
  async ({ req, user, ip }) => {
    const { code, body } = schema.parse(await req.json());

    const template = await prisma.messageTemplate.findUnique({ where: { code }, select: { id: true } });
    if (!template) throw notFound("Unknown template");

    await prisma.messageTemplate.update({ where: { id: template.id }, data: { body } });

    await audit({
      actorId: user!.id,
      action: "template.updated",
      entityType: "MESSAGE_TEMPLATE",
      entityId: template.id,
      ip,
    });
    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN"] },
);
