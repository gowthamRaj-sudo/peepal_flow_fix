const MAX_IMAGE_DIMENSION = 1600;
const COMPRESS_QUALITY = 0.82;
const MIN_COMPRESS_BYTES = 400 * 1024;

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/heic") return file;
  if (file.size <= MIN_COMPRESS_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob && blob.size < file.size ? blob : file),
        "image/jpeg",
        COMPRESS_QUALITY,
      );
    });
  } catch {
    return file;
  }
}

export async function uploadFile(file: File): Promise<{ id?: string; error?: string }> {
  const prepared = await compressImage(file);
  const payload = prepared instanceof File ? file : new File([prepared], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });

  const body = new FormData();
  body.append("file", payload);
  try {
    const res = await fetch("/api/uploads", { method: "POST", body });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      return { error: data?.error ?? "Upload failed" };
    }
    const data = (await res.json()) as { id: string };
    return { id: data.id };
  } catch {
    return { error: "Network error while uploading" };
  }
}
