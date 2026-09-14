import { NextResponse } from "next/server";
import { z } from "zod";
import { notFound } from "@/lib/errors";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/server/audit";
import { refreshProjectPages } from "@/server/revalidate";
import { storage } from "@/services/storage";
import { PhotoStage } from "@prisma/client";

export const runtime = "nodejs";

const STAGES = new Set<string>(Object.values(PhotoStage));

const updateSchema = z.object({
  stage: z
    .string()
    .refine((s) => STAGES.has(s), { message: "Invalid stage" })
    .optional(),
  caption: z.string().max(160).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

interface RouteCtx {
  params: Promise<{ id: string; photoId: string }>;
}

export const PATCH = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const id = (await ctx.params).id;
    const photoId = (await ctx.params).photoId;
    const body = updateSchema.parse(await req.json());

    const photo = await prisma.portfolioPhoto.findUnique({
      where: { id: photoId },
      select: { id: true, projectId: true },
    });
    if (!photo || photo.projectId !== id) throw notFound("Photo not found");

    await prisma.portfolioPhoto.update({
      where: { id: photoId },
      data: {
        stage: body.stage as PhotoStage | undefined,
        caption: body.caption === undefined ? undefined : body.caption || null,
        sortOrder: body.sortOrder,
      },
    });

    const project = await prisma.portfolioProject.findUnique({ where: { id }, select: { slug: true } });
    if (project) refreshProjectPages(project.slug);

    await audit({
      actorId: user!.id,
      action: "portfolio.photo_updated",
      entityType: "PORTFOLIO_PROJECT",
      entityId: id,
      meta: { photoId },
      ip,
    });

    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN", "STAFF"], csrf: false },
);

export const DELETE = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const id = (await ctx.params).id;
    const photoId = (await ctx.params).photoId;

    const photo = await prisma.portfolioPhoto.findUnique({
      where: { id: photoId },
      select: { id: true, projectId: true, storageKey: true },
    });
    if (!photo || photo.projectId !== id) throw notFound("Photo not found");

    await prisma.portfolioPhoto.delete({ where: { id: photoId } });
    await storage().delete(photo.storageKey).catch(() => {});

    const project = await prisma.portfolioProject.findUnique({ where: { id }, select: { slug: true } });
    if (project) refreshProjectPages(project.slug);

    await audit({
      actorId: user!.id,
      action: "portfolio.photo_deleted",
      entityType: "PORTFOLIO_PROJECT",
      entityId: id,
      meta: { photoId },
      ip,
    });

    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN", "STAFF"], csrf: false },
);