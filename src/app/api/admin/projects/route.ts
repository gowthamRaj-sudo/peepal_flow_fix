import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

const createSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().max(5000).optional().or(z.literal("")),
  materials: z.string().max(2000).optional().or(z.literal("")),
  serviceId: z.string().min(1),
  areaId: z.string().min(1).optional().or(z.literal("")),
  completedOn: z.string().optional(),
  isPublished: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export const POST = withApi(
  async ({ req, user, ip }) => {
    const body = createSchema.parse(await req.json());
    const slug = body.slug?.trim() || slugify(body.title);

    if (!slug) {
      return NextResponse.json({ error: "Please provide a title or a slug" }, { status: 400 });
    }

    const exists = await prisma.portfolioProject.findUnique({ where: { slug }, select: { id: true } });
    if (exists) {
      return NextResponse.json({ error: "A project with this URL slug already exists" }, { status: 409 });
    }

    const project = await prisma.portfolioProject.create({
      data: {
        title: body.title,
        slug,
        description: body.description || "",
        materials: body.materials || null,
        serviceId: body.serviceId,
        areaId: body.areaId || null,
        completedOn: body.completedOn ? new Date(body.completedOn) : null,
        isPublished: body.isPublished ?? false,
        sortOrder: body.sortOrder ?? 0,
      },
      select: { id: true, slug: true },
    });

    await audit({
      actorId: user!.id,
      action: "portfolio.created",
      entityType: "PORTFOLIO_PROJECT",
      entityId: project.id,
      meta: { slug: project.slug, title: body.title },
      ip,
    });

    return NextResponse.json({ id: project.id, slug: project.slug }, { status: 201 });
  },
  { roles: ["ADMIN", "STAFF"], csrf: false },
);
