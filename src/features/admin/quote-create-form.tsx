"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { formatInr } from "@/lib/money";

interface Line {
  kind: "MATERIALS" | "LABOUR" | "OTHER";
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

const emptyLine: Line = { kind: "MATERIALS", description: "", quantity: 1, unit: "nos", unitPrice: 0 };

export function QuoteCreateForm({
  customers,
  presetCustomerId,
  presetLeadId,
  presetJobId,
}: {
  customers: { id: string; name: string; phone: string }[];
  presetCustomerId?: string;
  presetLeadId?: string;
  presetJobId?: string;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(presetCustomerId ?? "");
  const [workDescription, setWorkDescription] = useState("");
  const [materialsNote, setMaterialsNote] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }]);
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [validUntilDays, setValidUntilDays] = useState(15);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    const d = Math.min(discount || 0, subtotal);
    const base = subtotal - d;
    const taxAmount = Math.round(base * (taxPercent || 0)) / 100 * 100 / 100;
    const total = base + taxAmount;
    return {
      subtotal,
      discount: d,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [lines, discount, taxPercent]);

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          leadId: presetLeadId || undefined,
          jobId: presetJobId || undefined,
          workDescription: workDescription || undefined,
          materialsNote: materialsNote || undefined,
          discount,
          taxPercent,
          notes: notes || undefined,
          validUntilDays,
          items: lines.filter((l) => l.description.trim()),
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? "Could not create the quotation");
        return;
      }
      router.replace(`/admin/quotes/${data.id}`);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Field label="Customer" required htmlFor="q-customer">
        <Select id="q-customer" required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Select customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
          ))}
        </Select>
      </Field>

      <Field label="Scope of work" hint="Shown at the top of the PDF" htmlFor="q-desc">
        <Textarea id="q-desc" rows={2} value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} placeholder="Complete renovation of attached bathroom including plumbing rework, waterproofing, tiling and CP fittings…" />
      </Field>

      {/* Line items */}
      <section aria-label="Line items">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Items</h2>
          <Button type="button" size="sm" variant="outline" onClick={() => setLines((ls) => [...ls, { ...emptyLine }])}>
            <Plus className="h-4 w-4" aria-hidden /> Add item
          </Button>
        </div>
        <ul role="list" className="mt-3 space-y-3">
          {lines.map((line, idx) => (
            <li key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="grid gap-3 sm:grid-cols-[110px_1fr_90px_90px_110px_36px] sm:items-end">
                <Field label={`Type`} htmlFor={`kind-${idx}`}>
                  <Select id={`kind-${idx}`} value={line.kind} onChange={(e) => updateLine(idx, { kind: e.target.value as Line["kind"] })}>
                    <option value="MATERIALS">Materials</option>
                    <option value="LABOUR">Labour</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </Field>
                <div className="sm:col-span-1">
                  <Field label="Description" htmlFor={`desc-${idx}`}>
                    <Input id={`desc-${idx}`} value={line.description} onChange={(e) => updateLine(idx, { description: e.target.value })} placeholder="Jaquar continental EWC" />
                  </Field>
                </div>
                <Field label="Qty" htmlFor={`qty-${idx}`}>
                  <Input id={`qty-${idx}`} inputMode="decimal" value={String(line.quantity)} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })} />
                </Field>
                <Field label="Unit" htmlFor={`unit-${idx}`}>
                  <Input id={`unit-${idx}`} value={line.unit} onChange={(e) => updateLine(idx, { unit: e.target.value })} placeholder="nos" />
                </Field>
                <Field label="Rate ₹" htmlFor={`price-${idx}`}>
                  <Input id={`price-${idx}`} inputMode="decimal" value={String(line.unitPrice)} onChange={(e) => updateLine(idx, { unitPrice: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })} />
                </Field>
                <button
                  type="button"
                  aria-label={`Remove item ${idx + 1}`}
                  onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                  disabled={lines.length === 1}
                  className="mb-1 flex h-[44px] w-full items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 sm:w-9"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Field label="Materials note" hint="e.g. Branded fittings list to be finalised with customer" htmlFor="q-mat">
        <Input id="q-mat" value={materialsNote} onChange={(e) => setMaterialsNote(e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Discount ₹" htmlFor="q-disc">
          <Input id="q-disc" inputMode="decimal" value={String(discount)} onChange={(e) => setDiscount(Number(e.target.value.replace(/[^\d.]/g, "")) || 0)} />
        </Field>
        <Field label="Tax %" htmlFor="q-tax">
          <Input id="q-tax" inputMode="decimal" value={String(taxPercent)} onChange={(e) => setTaxPercent(Number(e.target.value.replace(/[^\d.]/g, "")) || 0)} />
        </Field>
        <Field label="Valid for (days)" htmlFor="q-valid">
          <Input id="q-valid" inputMode="numeric" value={String(validUntilDays)} onChange={(e) => setValidUntilDays(Number(e.target.value.replace(/\D/g, "")) || 15)} />
        </Field>
        <div className="rounded-xl bg-slate-900 p-4 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total</p>
          <p className="mt-0.5 text-lg font-bold">{formatInr(totals.total)}</p>
          {discount > 0 && <p className="text-[11px] text-slate-400">incl. −{formatInr(totals.discount)}</p>}
        </div>
      </div>

      <Field label="Internal notes" htmlFor="q-notes">
        <Textarea id="q-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Not shown on the customer PDF" />
      </Field>

      <Button type="submit" size="lg" disabled={busy} className="w-full justify-center sm:w-auto">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Create quotation
      </Button>
    </form>
  );
}
