"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

export function QuoteRespond({
  token,
  status,
  businessPhone,
}: {
  token: string;
  status: string;
  businessPhone: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"ACCEPT" | "REJECT" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === "ACCEPTED") {
    return (
      <div className="rounded-xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
        You accepted this quotation. We&apos;ll call you shortly to schedule the work.
      </div>
    );
  }
  if (status === "REJECTED") {
    return (
      <div className="rounded-xl bg-slate-100 px-5 py-4 text-sm text-slate-600">
        You declined this quotation. If anything changed, just call us on{" "}
        <a href={`tel:${businessPhone}`} className="font-semibold text-brand-700">{businessPhone}</a> — we&apos;re happy to discuss.
      </div>
    );
  }

  async function respond(action: "ACCEPT" | "REJECT") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch(`/api/quote/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again or call us.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
      )}
      <p className="text-sm font-semibold text-slate-700">Happy with the quotation?</p>
      <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
        <button
          onClick={() => void respond("ACCEPT")}
          disabled={busy !== null}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 text-base font-bold text-white hover:bg-accent-600 disabled:opacity-60"
        >
          {busy === "ACCEPT" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Check className="h-5 w-5" aria-hidden />}
          Accept quotation
        </button>
        <button
          onClick={() => void respond("REJECT")}
          disabled={busy !== null}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy === "REJECT" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <X className="h-5 w-5" aria-hidden />}
          Not now
        </button>
      </div>
    </div>
  );
}
