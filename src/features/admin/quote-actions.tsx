"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuoteActions({
  quoteId,
  status,
  publicToken,
}: {
  quoteId: string;
  status: string;
  publicToken: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Action failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Quote actions" className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-sm font-semibold text-slate-800">Actions</h2>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      <Button
        size="md"
        disabled={busy || status !== "DRAFT"}
        onClick={() => void act("SEND")}
        className="w-full justify-center"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        Generate PDF &amp; send
      </Button>
      <Button
        type="button"
        size="md"
        variant="outline"
        className="w-full justify-center"
        onClick={async () => {
          await navigator.clipboard.writeText(`${location.origin}/quote/${publicToken}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : null} Copy customer link
      </Button>
      {status === "SENT" || status === "VIEWED" ? (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void act("MARK_ACCEPTED")} className="flex-1 justify-center">
            <Check className="h-4 w-4" aria-hidden /> Accepted?
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void act("MARK_REJECTED")} className="flex-1 justify-center">
            <X className="h-4 w-4" aria-hidden /> Rejected
          </Button>
        </div>
      ) : null}
      <p className="text-[11px] leading-relaxed text-slate-400">
        Sending generates the PDF, stores it securely and queues a WhatsApp message with the
        secure link.
      </p>
    </section>
  );
}
