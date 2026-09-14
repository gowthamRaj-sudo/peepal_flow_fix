import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageDriver, StoredObject } from "./driver";
import { env } from "@/lib/env";

let client: S3Client | null = null;

function s3(): S3Client {
  if (!client) {
    if (!env.S3_BUCKET || !env.S3_REGION) {
      throw new Error("S3 storage requires S3_BUCKET and S3_REGION");
    }
    client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials: env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? "",
          }
        : undefined,
    });
  }
  return client;
}

export class S3Driver implements StorageDriver {
  readonly id = "s3";

  private bucket(): string {
    if (!env.S3_BUCKET) throw new Error("S3_BUCKET is not configured");
    return env.S3_BUCKET;
  }

  async put(key: string, data: Buffer, mimeType: string): Promise<StoredObject> {
    await s3().send(
      new PutObjectCommand({
        Bucket: this.bucket(),
        Key: key,
        Body: data,
        ContentType: mimeType,
      }),
    );
    return { key, sizeBytes: data.byteLength, mimeType };
  }

  async signedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      s3(),
      new GetObjectCommand({ Bucket: this.bucket(), Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  async delete(key: string): Promise<void> {
    await s3().send(new DeleteObjectCommand({ Bucket: this.bucket(), Key: key }));
  }
}
