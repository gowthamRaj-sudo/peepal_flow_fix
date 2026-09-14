import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { notFound } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { audit } from "@/server/audit";
import { storage } from "@/services/storage";

export const runtime = "nodejs";

const updateSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(5000).optional().or(z.literal("")),
  materials: z.string().max(2000).optional().or(z.literal("")),
  serviceId: z.string().min(1).optional(),
  areaId: z.string().min(1).optional().or(z.literal("")),
  completedOn: z.string().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export const PATCH = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const id = (await ctx.params).id;
    const body = updateSchema.parse(await req.json());

    const existing = await prisma.portfolioProject.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw notFound("Project not found");

    if (body.slug) {
      const clash = await prisma.portfolioProject.findUnique({
        where: { slug: body.slug },
        select: { id: true },
      });
      if (clash && clash.id !== id) {
        return NextResponse.json({ error: "A project with this URL slug already exists" }, { status: 409 });
      }
    }

    const project = await prisma.portfolioProject.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description === undefined ? undefined : body.description || "",
        materials: body.materials === undefined ? undefined : body.materials || null,
        serviceId: body.serviceId,
        areaId: body.areaId === undefined ? undefined : body.areaId || null,
        completedOn: body.completedOn === undefined ? undefined : body.completedOn ? new Date(body.completedOn) : null,
        isPublished: body.isPublished,
        sortOrder: body.sortOrder,
      },
      select: { id: true, slug: true },
    });

    await audit({
      actorId: user!.id,
      action: "portfolio.updated",
      entityType: "PORTFOLIO_PROJECT",
      entityId: project.id,
      meta: { slug: project.slug, keys: Object.keys(body) },
      ip,
    });

    return NextResponse.json({ ok: true, slug: project.slug });
  },
  { roles: ["ADMIN", "STAFF"], csrf: false },
);

export const DELETE = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const id = (await ctx.params).id;

    const project = await prisma.portfolioProject.findUnique({
      where: { id },
      include: { photos: { select: { storageKey: true } } },
    });
    if (!project) throw notFound("Project not found");

    await prisma.portfolioProject.delete({ where: { id } });

    for (const photo of project.photos) {
      await storage().delete(photo.storageKey).catch(() => {});
    }

    await audit({
      actorId: user!.id,
      action: "portfolio.deleted",
      entityType: "PORTFOLIO_PROJECT",
      entityId: id,
      meta: { slug: project.slug, photos: project.photos.length },
      ip,
    });

    return NextResponse.json({ ok: true });
  },
  { roles: ["ADMIN", "STAFF"], csrf: false },
);