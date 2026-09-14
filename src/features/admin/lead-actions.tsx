"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, CalendarClock, ArrowRight, StickyNote, Briefcase, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

interface Props {
  leadId: string;
  status: string;
  nextStatuses: { value: string; label: string }[];
  assignedToId: string | null;
  workers: { id: string; name: string; role: string }[];
  visitAt: string | null;
  hasJob: boolean;
}

export function LeadActions({
  leadId,
  status,
  nextStatuses,
  assignedToId,
  workers,
  visitAt,
  hasJob,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState(nextStatuses[0]?.value ?? "");
  const [worker, setWorker] = useState(assignedToId ?? "");
  const [visit, setVisit] = useState(
    visitAt ? new Date(visitAt).toISOString().slice(0, 16) : "",
  );

  async function patch(body: Record<string, unknown>, tag: string) {
    setBusy(tag);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
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
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Status */}
      <section aria-labelledby="lead-status-h" className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <h3 id="lead-status-h" className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <ArrowRight className="h-4 w-4 text-brand-600" aria-hidden /> Move status
        </h3>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="flex-1">
            {nextStatuses.length === 0 && <option value="">No further transitions</option>}
            {nextStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
          <Button
            size="md"
            disabled={!nextStatus || busy !== null}
            onClick={async () => {
              const ok = await patch({ status: nextStatus }, "status");
              if (ok && nextStatus === "JOB_SCHEDULED" && !hasJob) {
                router.push(`/admin/jobs/new?leadId=${leadId}`);
              }
            }}
          >
            {busy === "status" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Update"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Setting &ldquo;Contacted&rdquo; records response time for the marketing dashboard.
        </p>
      </section>

      {/* Assignment + visit */}
      <section aria-labelledby="lead-schedule-h" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2">
        <Field label="Assign to" htmlFor="assign-worker">
          <div className="flex gap-2">
            <Select id="assign-worker" value={worker} onChange={(e) => setWorker(e.target.value)} className="flex-1">
              <option value="">Unassigned</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
              ))}
            </Select>
            <Button
              variant="outline"
              size="md"
              disabled={busy !== null}
              aria-label="Save assignment"
              onClick={() => void patch({ assignedToId: worker || null }, "assign")}
            >
              {busy === "assign" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
            </Button>
          </div>
        </Field>

        <Field label="Visit date & time" htmlFor="visit-at">
          <div className="flex gap-2">
            <Input
              id="visit-at"
              type="datetime-local"
              value={visit}
              onChange={(e) => setVisit(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="md"
              disabled={busy !== null || !visit}
              aria-label="Save visit time"
              onClick={() =>
                void patch({ visitAt: new Date(visit).toISOString() }, "visit")
              }
            >
              {busy === "visit" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CalendarClock className="h-4 w-4" aria-hidden />}
            </Button>
          </div>
        </Field>
      </section>

      {/* Convert */}
      <section aria-labelledby="lead-convert-h" className="rounded-xl border border-brand-100 bg-brand-50 p-4">
        <h3 id="lead-convert-h" className="text-sm font-semibold text-brand-900">Take action</h3>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {!hasJob && (
            <Button
              size="md"
              disabled={busy !== null}
              onClick={() => void patch({ status: "JOB_SCHEDULED" }, "tojob").then((ok) => {
                if (ok) router.push(`/admin/jobs/new?leadId=${leadId}`);
              })}
            >
              <Briefcase className="h-4 w-4" aria-hidden /> Convert to Job
            </Button>
          )}
          <Button
            size="md"
            variant="secondary"
            onClick={() => router.push(`/admin/quotes/new?${new URLSearchParams({ leadId }).toString()}`)}
          >
            <FileSignature className="h-4 w-4" aria-hidden /> Create Quotation
          </Button>
        </div>
      </section>

      {/* Note */}
      <section aria-labelledby="lead-note-h" className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <h3 id="lead-note-h" className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <StickyNote className="h-4 w-4 text-accent-600" aria-hidden /> Add internal note
        </h3>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Called customer — will decide after discussing with family…"
          className="mt-2.5"
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            disabled={busy !== null || note.trim().length === 0}
            onClick={async () => {
              const ok = await fetch(`/api/admin/leads/${leadId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: note }),
              }).then((r) => r.ok);
              if (ok) {
                setNote("");
                router.refresh();
              }
            }}
          >
            Save note
          </Button>
        </div>
      </section>

      <p className="sr-only">Current status: {status}</p>
    </div>
  );
}
