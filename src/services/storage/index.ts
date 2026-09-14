import type { StorageDriver } from "./driver";
import { LocalDriver } from "./local";
import { S3Driver } from "./s3";
import { env } from "@/lib/env";

export * from "./driver";
export {
  LocalDriver,
  newStorageKey,
  safePath,
  signLocalKey,
  verifyLocalSignature,
} from "./local";

let driver: StorageDriver | null = null;

export function storage(): StorageDriver {
  if (!driver) {
    driver = env.STORAGE_DRIVER === "s3" ? new S3Driver() : new LocalDriver();
  }
  return driver;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
]);

const MAGIC_BYTES: { mime: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    test: (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    mime: "image/heic",
    test: (b) => b.subarray(4, 10).toString("ascii").startsWith("ftyp"),
  },
  { mime: "video/mp4", test: (b) => b.subarray(4, 8).toString("ascii") === "ftyp" },
  { mime: "application/pdf", test: (b) => b.subarray(0, 4).toString("ascii") === "%PDF" },
];

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

export function validateUpload(
  buffer: Buffer,
  declaredMime: string,
): { ok: true; mime: string } | { ok: false; reason: string } {
  const header = buffer.subarray(0, 16);
  let detected = "";
  for (const entry of MAGIC_BYTES) {
    if (entry.test(header)) {
      detected = entry.mime;
      break;
    }
  }

  let effectiveMime = declaredMime.split(";")[0]?.trim() ?? "";
  if (!ALLOWED_MIME_TYPES.has(effectiveMime)) {
    return { ok: false, reason: `Unsupported file type: ${effectiveMime || "unknown"}` };
  }

  if (detected) {
    const compatible =
      detected === effectiveMime ||
      (detected.startsWith("video/") && effectiveMime.startsWith("video/")) ||
      (detected.startsWith("image/") && effectiveMime.startsWith("image/"));
    if (!compatible) {
      return { ok: false, reason: "File content does not match its type" };
    }
  }

  const isVideo = VIDEO_MIME_TYPES.includes(effectiveMime);
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (buffer.byteLength > limit) {
    return { ok: false, reason: `File too large (max ${Math.round(limit / 1024 / 1024)}MB)` };
  }
  if (buffer.byteLength < 100) {
    return { ok: false, reason: "File appears to be empty or corrupted" };
  }
  return { ok: true, mime: effectiveMime };
}
