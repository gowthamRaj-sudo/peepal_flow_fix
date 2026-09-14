import { NextResponse } from "next/server";
import { badRequest } from "@/lib/errors";
import { withApi } from "@/lib/api";
import {
  newStorageKey,
  storage,
  validateUpload,
} from "@/services/storage";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export const POST = withApi(
  async ({ req }) => {
    const form = await req.formData().catch(() => null);
    if (!form) throw badRequest("Expected multipart form data");

    const file = form.get("file");
    if (!(file instanceof File)) throw badRequest("Missing file field");

    const buffer = Buffer.from(await file.arrayBuffer());
    const verdict = validateUpload(buffer, file.type || "application/octet-stream");
    if (!verdict.ok) throw badRequest(verdict.reason);

    const key = newStorageKey("uploads", file.name);
    const stored = await storage().put(key, buffer, verdict.mime);

    const row = await prisma.upload.create({
      data: {
        key: stored.key,
        filename: file.name.slice(0, 200),
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        kind: "LEAD_PHOTO",
      },
      select: { id: true },
    });

    logger.info("upload.stored", { key: stored.key, sizeBytes: stored.sizeBytes });
    return NextResponse.json({ id: row.id }, { status: 201 });
  },
  {
    rateLimit: { windowMs: 60 * 60 * 1000, max: 30 },
    csrf: false,
  },
);
