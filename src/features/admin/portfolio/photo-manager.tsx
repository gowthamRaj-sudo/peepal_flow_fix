"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import type { PhotoStage } from "@prisma/client";

const STAGES: { value: PhotoStage; label: string }[] = [
  { value: "BEFORE", label: "Before" },
  { value: "DURING", label: "During" },
  { value: "AFTER", label: "After" },
];

export interface PortfolioPhotoRow {
  id: string;
  stage: PhotoStage;
  caption: string | null;
  sortOrder: number;
  storageKey: string;
}

export function PhotoManager({
  projectId,
  photos,
}: {
  projectId: string;
  photos: PortfolioPhotoRow[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<PhotoStage>("AFTER");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("stage", stage);
      body.append("caption", caption);
      const res = await fetch(`/api/admin/projects/${projectId}/photos`, { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Upload failed");
        return;
      }
      setCaption("");
      router.refresh();
    } catch {
      setError("Network error while uploading");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function updatePhoto(photoId: string, patch: { stage?: PhotoStage; caption?: string; sortOrder?: number }) {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) router.refresh();
    } catch {
      // non-blocking
    }
  }

  async function removePhoto(photoId: string) {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/photos/${photoId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } catch {
      // non-blocking
    }
  }

  const grouped = STAGES.map((s) => ({
    ...s,
    items: photos.filter((p) => p.stage === s.value).sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Add a photo</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <Field label="Photo stage" htmlFor="ph-stage">
            <Select id="ph-stage" value={stage} onChange={(e) => setStage(e.target.value as PhotoStage)}>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Caption (optional)" htmlFor="ph-caption">
            <Input
              id="ph-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={160}
              placeholder="e.g. New concealed piping"
            />
          </Field>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="sr-only"
            id="ph-file"
            onChange={(e) => void upload(e.target.files)}
          />
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="justify-center">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
            Choose image
          </Button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      </div>

      <div className="space-y-6">
        {grouped.map((group) => {
          if (group.items.length === 0) return null;
          return (
            <section key={group.value} aria-label={group.label}>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{group.label}</h3>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
                {group.items.map((photo) => (
                  <li key={photo.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/files/${encodeURIComponent(photo.storageKey)}`}
                      alt={photo.caption ?? `${group.label} photo`}
                      className="aspect-video w-full object-cover"
                    />
                    <div className="space-y-2 p-3">
                      <div className="flex items-center gap-2">
                        <Select
                          aria-label="Stage"
                          className="min-h-[36px] px-2 py-1 text-xs"
                          value={photo.stage}
                          onChange={(e) => void updatePhoto(photo.id, { stage: e.target.value as PhotoStage })}
                        >
                          {STAGES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </Select>
                        <Input
                          aria-label="Caption"
                          className="min-h-[36px] px-2 py-1 text-xs"
                          defaultValue={photo.caption ?? ""}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v !== (photo.caption ?? "")) void updatePhoto(photo.id, { caption: v });
                          }}
                          placeholder="Caption"
                          maxLength={160}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Delete photo"
                          onClick={() => void removePhoto(photo.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {photos.length === 0 && (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
          No photos yet. Add a before/after pair to bring this project to life.
        </p>
      )}
    </div>
  );
}