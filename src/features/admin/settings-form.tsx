"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

export interface SettingsFormValues {
  business_phone: string;
  business_whatsapp: string;
  business_email: string;
  working_hours: string;
  google_review_url: string;
  review_request_delay_days: number;
}

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not save settings");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const fields: { key: keyof SettingsFormValues; label: string; hint?: string; type?: string }[] = [
    { key: "business_phone", label: "Business phone", hint: "Shown on the website and in quotations" },
    { key: "business_whatsapp", label: "WhatsApp number", hint: "Receives new-enquiry alerts" },
    { key: "business_email", label: "Email", type: "email" },
    { key: "working_hours", label: "Working hours", hint: 'e.g. "Mon – Sun · 8:00 AM – 8:00 PM"' },
    {
      key: "google_review_url",
      label: "Google review link",
      hint: "Sent to customers after job completion",
    },
  ];

  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <div key={field.key}>
          <label htmlFor={field.key} className="block text-sm font-semibold text-slate-700">
            {field.label}
          </label>
          <Input
            id={field.key}
            type={field.type ?? "text"}
            value={String(values[field.key] ?? "")}
            onChange={(e) =>
              set(field.key, (field.type === "number" ? Number(e.target.value) : e.target.value) as never)
            }
            className="mt-1.5"
          />
          {field.hint && <p className="mt-1 text-xs text-slate-400">{field.hint}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="review_request_delay_days" className="block text-sm font-semibold text-slate-700">
          Review request delay (days after completion)
        </label>
        <Input
          id="review_request_delay_days"
          type="number"
          min={0}
          max={30}
          value={values.review_request_delay_days}
          onChange={(e) => set("review_request_delay_days", Number(e.target.value))}
          className="mt-1.5 w-32"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={() => void save()} disabled={busy} className="min-w-36 justify-center">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Save settings"}
        </Button>
        {saved && <span className="text-sm font-semibold text-emerald-600">Saved ✓</span>}
      </div>
    </div>
  );
}
