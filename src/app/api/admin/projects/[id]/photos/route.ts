import { NextResponse } from "next/server";
import { notFound } from "@/lib/errors";
import { badRequest } from "@/lib/errors";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/server/audit";
import {
  IMAGE_MIME_TYPES,
  newStorageKey,
  storage,
  validateUpload,
} from "@/services/storage";
import { PhotoStage } from "@prisma/client";

export const runtime = "nodejs";

const STAGES = new Set<string>(Object.values(PhotoStage));

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export const POST = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const id = (await ctx.params).id;

    const project = await prisma.portfolioProject.findUnique({ where: { id }, select: { id: true } });
    if (!project) throw notFound("Project not found");

    const form = await req.formData().catch(() => null);
    if (!form) throw badRequest("Expected multipart form data");

    const file = form.get("file");
    if (!(file instanceof File)) throw badRequest("Missing file field");

    const stageRaw = String(form.get("stage") ?? "AFTER");
    if (!STAGES.has(stageRaw)) throw badRequest("Invalid photo stage");
    const stage = stageRaw as PhotoStage;

    const caption = String(form.get("caption") ?? "").trim().slice(0, 160) || null;
    const sortOrderRaw = Number(form.get("sortOrder") ?? "0");
    const sortOrder = Number.isFinite(sortOrderRaw) ? Math.max(0, Math.floor(sortOrderRaw)) : 0;

    const buffer = Buffer.from(await file.arrayBuffer());
    const verdict = validateUpload(buffer, file.type || "application/octet-stream");
    if (!verdict.ok) throw badRequest(verdict.reason);
    if (!IMAGE_MIME_TYPES.includes(verdict.mime)) {
      throw badRequest("Only image files can be added to a project");
    }

    const key = newStorageKey("portfolio", file.name);
    const stored = await storage().put(key, buffer, verdict.mime);

    const photo = await prisma.portfolioPhoto.create({
      data: {
        projectId: id,
        stage,
        storageKey: stored.key,
        caption,
        sortOrder,
      },
      select: { id: true },
    });

    await audit({
      actorId: user!.id,
      action: "portfolio.photo_added",
      entityType: "PORTFOLIO_PROJECT",
      entityId: id,
      meta: { photoId: photo.id, stage, sizeBytes: stored.sizeBytes },
      ip,
    });

    return NextResponse.json({ id: photo.id }, { status: 201 });
  },
  { roles: ["ADMIN", "STAFF"], csrf: false },
);