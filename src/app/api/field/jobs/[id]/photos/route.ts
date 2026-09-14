import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/errors";
import { newStorageKey, storage, validateUpload, IMAGE_MIME_TYPES } from "@/services/storage";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

const metaSchema = z.object({
  stage: z.enum(["BEFORE", "DURING", "AFTER"]),
});

export const POST = withApi<RouteCtx>(
  async ({ req, user, ip }, ctx) => {
    const { id: jobId } = await ctx.params;

    // Field workers may only upload to their own jobs.
    if (user!.role === "FIELD_WORKER") {
      const job = await prisma.job.findUnique({ where: { id: jobId }, select: { assignedToId: true } });
      if (!job || job.assignedToId !== user!.id) {
        return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
      }
    }

    const form = await req.formData().catch(() => null);
    if (!form) throw badRequest("Expected multipart form data");

    const stageResult = metaSchema.safeParse({ stage: form.get("stage") });
    if (!stageResult.success) throw badRequest("Missing photo stage");

    const file = form.get("file");
    if (!(file instanceof File)) throw badRequest("Missing file field");

    const buffer = Buffer.from(await file.arrayBuffer());
    // Job photos must be images only.
    const verdict = validateUpload(buffer, IMAGE_MIME_TYPES.includes(file.type) ? file.type : "image/jpeg");
    if (!verdict.ok) throw badRequest(verdict.reason);

    const key = newStorageKey("jobs", file.name);
    await storage().put(key, buffer, verdict.mime);

    const photo = await prisma.jobPhoto.create({
      data: {
        jobId,
        stage: stageResult.data.stage,
        storageKey: key,
        mimeType: verdict.mime,
        sizeBytes: buffer.byteLength,
        uploadedById: user!.id,
      },
      select: { id: true },
    });

    await audit({
      actorId: user!.id,
      action: "job.photo_uploaded",
      entityType: "JOB",
      entityId: jobId,
      meta: { stage: stageResult.data.stage },
      ip,
    });

    return NextResponse.json({ id: photo.id }, { status: 201 });
  },
  {
    roles: ["ADMIN", "STAFF", "FIELD_WORKER"],
    rateLimit: { windowMs: 60 * 60 * 1000, max: 120 },
    csrf: false,
  },
);
