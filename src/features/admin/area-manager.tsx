"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

export function AreaManager({
  areas,
}: {
  areas: { id: string; name: string; slug: string; isActive: boolean; leadCount: number }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function addArea() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    try {
      const res = await fetch("/api/admin/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Could not add area");
        return;
      }
      setName("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, isActive: boolean) {
    setBusy(true);
    try {
      await fetch("/api/admin/areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New area name (e.g. Thoraipakkam)" maxLength={80} />
        <Button onClick={() => void addArea()} disabled={busy || !name.trim()} className="shrink-0 justify-center">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
          Add area
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p>}

      <ul role="list" className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {areas.map((area) => (
          <li key={area.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{area.name}</p>
              <p className="text-xs text-slate-400">
                /areas/{area.slug} · {area.leadCount} leads
              </p>
            </div>
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500">
              <input
                type="checkbox"
                checked={area.isActive}
                disabled={busy}
                onChange={(e) => void toggle(area.id, e.target.checked)}
                className="h-4 w-4 rounded accent-brand-600"
              />
              Active on site
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
