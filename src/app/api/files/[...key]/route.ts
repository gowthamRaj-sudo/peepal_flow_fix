import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/services/storage";
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";

/**
 * Secure file serving for locally-stored uploads.
 * Files are never exposed directly: access requires either a valid signed URL
 * or an authenticated session with ownership/role checks.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await ctx.params;
  const key = keyParts.map(decodeURIComponent).join("/");

  const url = new URL(req.url);
  const expParam = url.searchParams.get("exp");
  const sig = url.searchParams.get("sig");

  if (!expParam || !sig) {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN" && session.role !== "STAFF") {
      const owns = await workerOwnsFile(session.id, key);
      if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (storage().id === "s3") {
    const signed = await storage().signedUrl(key);
    return NextResponse.redirect(signed);
  }

  const { verifyLocalSignature } = await import("@/services/storage/local");
  if (expParam && sig && !verifyLocalSignature(key, Number(expParam), sig)) {
    return NextResponse.json({ error: "Link expired or invalid" }, { status: 403 });
  }

  try {
    const { safePath } = await import("@/services/storage/local");
    const data = await readFile(safePath(key));
    const contentType = guessContentType(key);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

async function workerOwnsFile(workerId: string, key: string): Promise<boolean> {
  const photo = await prisma.jobPhoto.findFirst({
    where: { storageKey: key, job: { assignedToId: workerId } },
    select: { id: true },
  });
  return Boolean(photo);
}

function guessContentType(key: string): string {
  if (key.endsWith(".pdf")) return "application/pdf";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".webp")) return "image/webp";
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".webm")) return "video/webm";
  if (key.endsWith(".heic") || key.endsWith(".heif")) return "image/heic";
  return "image/jpeg";
}
