"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectRowActions({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle(published: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: published }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this project and its photos? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500">
        <input
          type="checkbox"
          checked={isPublished}
          disabled={busy}
          onChange={(e) => void toggle(e.target.checked)}
          className="h-4 w-4 rounded accent-brand-600"
        />
        Published
      </label>
      <Button variant="ghost" size="sm" aria-label="Delete project" disabled={busy} onClick={() => void remove()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4 text-red-500" aria-hidden />}
      </Button>
    </div>
  );
}