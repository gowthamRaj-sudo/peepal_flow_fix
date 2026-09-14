import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/server/audit";
import { badRequest } from "@/lib/errors";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
});

const updateSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean().optional(),
  name: z.string().trim().min(2).max(80).optional(),
  sortOrder: z.number().int().optional(),
});

export const POST = withApi(
  async ({ req, user, ip }) => {
    const data = createSchema.parse(await req.json());
    const exists = await prisma.serviceArea.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (exists) throw badRequest("An area with this slug already exists");

    const maxOrder = await prisma.serviceArea.aggregate({ _max: { sortOrder: true } });
    const area = await prisma.serviceArea.create({
      data: {
        name: data.name,
        slug: data.slug,
        context: `${data.name} and nearby streets — same-day response for most enquiries.`,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
      select: { id: true },
    });
    // Link all active services to the new area.
    await prisma.areaService.createMany({
      data: (await prisma.service.findMany({ where: { isActive: true }, select: { id: true } })).map((s) => ({
        serviceId: s.id,
        areaId: area.id,
      })),
      skipDuplicates: true,
    });
    await audit({ actorId: user!.id, action: "area.created", entityType: "SERVICE_AREA", entityId: area.id, ip });
    return NextResponse.json({ id: area.id }, { status: 201 });
  },
  { roles: ["ADMIN"] },
);

export const PATCH = withApi(
  async ({ req, user, ip }) => {
    const data = updateSchema.parse(await req.json());
    const { id, ...rest } = data;
    await prisma.serviceArea.update({ where: { id }, data: rest });
    await audit({
      actorId: user!.id,
      action: "area.updated",
      entityType: "SERVICE_AREA",
      entityId: id,
      meta: rest as Record<string, unknown>,
      ip,
    });
    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN"] },
);
