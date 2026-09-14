export interface StoredObject {
  key: string;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageDriver {
  readonly id: string;
  put(key: string, data: Buffer, mimeType: string): Promise<StoredObject>;
  signedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<void>;
}
