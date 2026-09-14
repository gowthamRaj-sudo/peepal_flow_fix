"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

export interface NewJobPreset {
  leadId?: string;
  customerId?: string;
  serviceId?: string;
  title?: string;
  address?: string;
}

export function JobCreateForm({
  customers,
  services,
  areas,
  workers,
  preset,
}: {
  customers: { id: string; name: string; phone: string }[];
  services: { id: string; name: string }[];
  areas: { id: string; name: string }[];
  workers: { id: string; name: string; role: string }[];
  preset: NewJobPreset;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState(preset.customerId ?? "");
  const [serviceId, setServiceId] = useState(preset.serviceId ?? "");
  const [areaId, setAreaId] = useState("");
  const [title, setTitle] = useState(preset.title ?? "");
  const [address, setAddress] = useState(preset.address ?? "");
  const [scheduledFor, setScheduledFor] = useState("");
  const [assignedToId, setAssignedToId] = useState(workers[0]?.id ?? "");
  const [notes, setNotes] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: preset.leadId || undefined,
          customerId,
          serviceId,
          areaId: areaId || undefined,
          title,
          address: address || undefined,
          scheduledFor: new Date(scheduledFor).toISOString(),
          assignedToId: assignedToId || undefined,
          notes: notes || undefined,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? "Could not create the job");
        return;
      }
      router.replace(`/admin/jobs/${data.id}`);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Field label="Customer" required htmlFor="job-customer">
        <Select id="job-customer" required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Select customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Service" required htmlFor="job-service">
          <Select id="job-service" required value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Select…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Area" htmlFor="job-area">
          <Select id="job-area" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            <option value="">Optional</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Job title" required hint="Short summary shown to the field worker" htmlFor="job-title">
        <Input id="job-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bathroom leakage repair — 2nd floor" maxLength={120} />
      </Field>

      <Field label="Site address" htmlFor="job-address">
        <Textarea id="job-address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Scheduled for" required htmlFor="job-when">
          <Input
            id="job-when"
            type="datetime-local"
            required
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </Field>
        <Field label="Assign to" htmlFor="job-worker">
          <Select id="job-worker" value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
            <option value="">Unassigned</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Notes for the field worker" htmlFor="job-notes">
        <Textarea id="job-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate code, parking, what was agreed on the call…" />
      </Field>

      <Button type="submit" size="lg" disabled={busy} className="w-full justify-center sm:w-auto">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Create job & notify
      </Button>
    </form>
  );
}
