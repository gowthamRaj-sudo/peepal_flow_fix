"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FieldJobButtons({
  jobId,
  status,
  photoCounts,
  mapsUrl,
}: {
  jobId: string;
  status: string;
  photoCounts: { before: number; after: number };
  mapsUrl: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: string) {
    setBusy(next);
    setError(null);
    try {
      const res = await fetch(`/api/field/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not update");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function saveNote() {
    if (!note.trim()) return;
    setBusy("note");
    try {
      await fetch(`/api/field/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note.trim() }),
      });
      setNote("");
      setNoteOpen(false);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "flex min-h-[64px] w-full items-center justify-center gap-2.5 rounded-xl text-lg font-bold shadow-card transition active:scale-[0.98] disabled:opacity-50";

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">{error}</p>}

      {status === "SCHEDULED" && (
        <button onClick={() => void setStatus("IN_PROGRESS")} disabled={busy !== null} className={`${btn} bg-accent-500 text-white`}>
          {busy === "IN_PROGRESS" ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> : <span aria-hidden>▶</span>}
          Start Job
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className={`${btn} cursor-pointer bg-brand-600 text-white ${photoCounts.before > 0 ? "" : "ring-4 ring-brand-100"}`}>
          {busy === "before" ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <>
              📷 Before Photo{photoCounts.before > 0 ? ` (${photoCounts.before})` : ""}
            </>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="sr-only"
            onChange={async (e) => {
              const files = e.target.files;
              if (!files?.length) return;
              setBusy("before");
              for (const file of Array.from(files)) {
                const body = new FormData();
                body.append("file", file);
                body.append("stage", "BEFORE");
                await fetch(`/api/field/jobs/${jobId}/photos`, { method: "POST", body }).catch(() => {});
              }
              setBusy(null);
              e.target.value = "";
              router.refresh();
            }}
          />
        </label>

        <label className={`${btn} cursor-pointer bg-slate-700 text-white ${photoCounts.after > 0 ? "" : status === "COMPLETED" || status === "IN_PROGRESS" ? "ring-4 ring-slate-200" : "opacity-60"}`}>
          {busy === "after" ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <>📷 After Photo{photoCounts.after > 0 ? ` (${photoCounts.after})` : ""}</>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="sr-only"
            disabled={status === "SCHEDULED"}
            onChange={async (e) => {
              const files = e.target.files;
              if (!files?.length) return;
              setBusy("after");
              for (const file of Array.from(files)) {
                const body = new FormData();
                body.append("file", file);
                body.append("stage", "AFTER");
                await fetch(`/api/field/jobs/${jobId}/photos`, { method: "POST", body }).catch(() => {});
              }
              setBusy(null);
              e.target.value = "";
              router.refresh();
            }}
          />
        </label>
      </div>

      {noteOpen ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={3000}
            placeholder="What was done, materials used, anything pending…"
            className="w-full rounded-lg border border-slate-300 p-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="flex-1 justify-center" onClick={() => setNoteOpen(false)}>
              Cancel
            </Button>
            <Button size="lg" className="flex-1 justify-center" disabled={!note.trim() || busy !== null} onClick={() => void saveNote()}>
              Save note
            </Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setNoteOpen(true)} className={`${btn} border-2 border-slate-300 bg-white text-slate-700`}>
          <StickyNote className="h-6 w-6" aria-hidden /> Add Notes
        </button>
      )}

      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`${btn} bg-blue-500 text-white`}>
        🧭 Navigate
      </a>

      {(status === "SCHEDULED" || status === "IN_PROGRESS") && (
        <button
          onClick={() => void setStatus("CANCELLED")}
          disabled={busy !== null}
          className="min-h-[48px] w-full rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
        >
          Cancel this visit
        </button>
      )}
    </div>
  );
}
