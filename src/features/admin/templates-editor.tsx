"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TemplateRow {
  code: string;
  name: string;
  channel: string;
  body: string;
}

export function TemplatesEditor({ templates }: { templates: TemplateRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(templates[0]?.code ?? "");
  const current = templates.find((t) => t.code === selected);
  const [body, setBody] = useState(current?.body ?? "");
  const [busy, setBusy] = useState(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function select(code: string) {
    setSelected(code);
    setBody(templates.find((t) => t.code === code)?.body ?? "");
    setError(null);
  }

  async function save() {
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: current.code, body }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not save template");
        return;
      }
      setSavedCode(current.code);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <nav aria-label="Message templates">
        <ul role="list" className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {templates.map((t) => (
            <li key={t.code}>
              <button
                onClick={() => select(t.code)}
                className={`w-full px-4 py-3 text-left ${selected === t.code ? "bg-brand-50" : "hover:bg-slate-50"}`}
              >
                <p className={`text-sm font-semibold ${selected === t.code ? "text-brand-700" : "text-slate-800"}`}>
                  {t.name}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400">{t.code}</p>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {current && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">{current.name}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              {current.channel}
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSavedCode(null);
            }}
            rows={8}
            maxLength={2000}
            className="mt-4 w-full rounded-lg border border-slate-300 p-3 font-mono text-sm leading-relaxed focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            aria-label="Template body"
          />
          <p className="mt-2 text-xs text-slate-400">
            Use {"{{variables}}"} like {"{{name}}"}, {"{{service}}"}, {"{{link}}"}. Unrecognised
            variables are left as-is so nothing breaks silently.
          </p>
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={() => void save()} disabled={busy || body.trim() === current.body} className="min-w-36 justify-center">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Save template"}
            </Button>
            {savedCode === current.code && <span className="text-sm font-semibold text-emerald-600">Saved ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
