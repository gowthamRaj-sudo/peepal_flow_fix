"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";

export function JobAdminActions({
  jobId,
  status,
  assignedToId,
  workers,
}: {
  jobId: string;
  status: string;
  assignedToId: string | null;
  workers: { id: string; name: string; role: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [worker, setWorker] = useState(assignedToId ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Update failed");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Job actions" className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-sm font-semibold text-slate-800">Manage job</h2>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <div className="flex gap-2">
        <Button size="md" disabled={busy || status !== "SCHEDULED"} onClick={() => void patch({ status: "IN_PROGRESS" })} className="flex-1 justify-center">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />} Start
        </Button>
        <Button size="md" variant="secondary" disabled={busy || status !== "IN_PROGRESS"} onClick={() => void patch({ status: "COMPLETED" })} className="flex-1 justify-center">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Complete
        </Button>
      </div>

      <Field label="Assign worker" htmlFor={`assign-${jobId}`}>
        <div className="flex gap-2">
          <Select id={`assign-${jobId}`} value={worker} onChange={(e) => setWorker(e.target.value)} className="flex-1">
            <option value="">Unassigned</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
            ))}
          </Select>
          <Button variant="outline" size="md" disabled={busy} aria-label="Save assignment" onClick={() => void patch({ assignedToId: worker || null })}>
            <UserCheck className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </Field>

      <Field label="Add note to job record" htmlFor={`note-${jobId}`}>
        <Textarea id={`note-${jobId}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={3000} />
      </Field>
      <div className="flex justify-between gap-2">
        <Button size="sm" variant="ghost" disabled={busy || status === "CANCELLED" || status === "COMPLETED"} onClick={() => void patch({ status: "CANCELLED" })}>
          <XCircle className="h-4 w-4" aria-hidden /> Cancel job
        </Button>
        <Button size="sm" variant="outline" disabled={busy || !notes.trim()} onClick={() => void patch({ notes }).then(() => setNotes(""))}>
          Save note
        </Button>
      </div>
    </section>
  );
}
