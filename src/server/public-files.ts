import { storage } from "@/services/storage";

const PUBLIC_EXPIRY_SECONDS = 2 * 24 * 60 * 60;

export async function publicFileUrl(storageKey: string): Promise<string> {
  return storage().signedUrl(storageKey, PUBLIC_EXPIRY_SECONDS);
}