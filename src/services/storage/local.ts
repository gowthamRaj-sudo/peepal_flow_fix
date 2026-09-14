import { createHmac, randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageDriver, StoredObject } from "./driver";
import { env } from "@/lib/env";

function baseDir(): string {
  return path.resolve(process.cwd(), env.STORAGE_LOCAL_DIR);
}

export function safePath(key: string): string {
  const resolved = path.resolve(baseDir(), key);
  if (!resolved.startsWith(baseDir())) throw new Error("Invalid storage key");
  return resolved;
}

export function signLocalKey(key: string, exp: number): string {
  return createHmac("sha256", env.AUTH_SECRET).update(`${key}:${exp}`).digest("hex").slice(0, 32);
}

export function verifyLocalSignature(key: string, exp: number, sig: string): boolean {
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = signLocalKey(key, exp);
  return expected === sig;
}

export class LocalDriver implements StorageDriver {
  readonly id = "local";

  async put(key: string, data: Buffer, mimeType: string): Promise<StoredObject> {
    const filePath = safePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return { key, sizeBytes: data.byteLength, mimeType };
  }

  async signedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const sig = signLocalKey(key, exp);
    return `/api/files/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`;
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(safePath(key));
    } catch {
      // already gone
    }
  }
}

export function newStorageKey(prefix: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 8);
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}/${date}/${randomUUID()}${ext}`;
}
