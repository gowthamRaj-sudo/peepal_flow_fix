import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { quotesService } from "@/server/quotes.service";
import { getPublicContact, getSettings } from "@/server/settings";
import { BUSINESS } from "@/config/business";
import { formatInr } from "@/lib/money";
import { QuoteRespond } from "@/features/quotes/quote-respond";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Quotation",
  robots: { index: false, follow: false },
};

const KIND_LABEL: Record<string, string> = {
  MATERIALS: "Materials",
  LABOUR: "Labour",
  OTHER: "Other",
};

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [quote, settings] = await Promise.all([
    quotesService.getByToken(token).catch(() => null),
    getSettings().catch(() => null),
  ]);
  if (!quote) notFound();

  const phone = settings?.phone || BUSINESS.phone;

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <header className="mb-5 text-center">
          <p className="text-lg font-bold text-slate-900">{BUSINESS.name}</p>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-600">
            Quotation · {quote.code}
          </p>
        </header>

        <main className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="bg-brand-600 px-6 py-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold">Quotation for {quote.customer.name}</h1>
                <p className="mt-0.5 text-sm text-brand-100">{quote.customer.phone}</p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                {quote.status === "EXPIRED" ? "EXPIRED" : quote.status}
              </span>
            </div>
            {quote.validUntil && (
              <p className="mt-2 text-xs text-brand-100">
                Valid until{" "}
                {new Date(quote.validUntil).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          <div className="space-y-6 p-6">
            {quote.workDescription && (
              <section aria-label="Scope of work">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Scope of work</h2>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {quote.workDescription}
                </p>
              </section>
            )}

            <section aria-label="Price breakdown">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Breakdown</h2>
              <ul role="list" className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
                {quote.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{item.description}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {KIND_LABEL[item.kind] ?? item.kind} · {Number(item.quantity)} {item.unit} ×{" "}
                        {formatInr(Number(item.unitPrice))}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-slate-800">{formatInr(Number(item.amount))}</p>
                  </li>
                ))}
              </ul>

              <dl className="mx-auto mt-4 max-w-[280px] space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatInr(Number(quote.subtotal))}</dd></div>
                {Number(quote.discount) > 0 && (
                  <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd>− {formatInr(Number(quote.discount))}</dd></div>
                )}
                {Number(quote.taxPercent) > 0 && (
                  <div className="flex justify-between"><dt className="text-slate-500">Tax ({Number(quote.taxPercent)}%)</dt><dd>{formatInr(Number(quote.taxAmount))}</dd></div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-extrabold text-brand-700">
                  <dt>Total</dt><dd>{formatInr(Number(quote.total))}</dd>
                </div>
              </dl>
            </section>

            {["SENT", "VIEWED", "EXPIRED"].includes(quote.status) && (
              <QuoteRespond token={token} status={quote.status} businessPhone={phone} />
            )}

            {quote.paymentTerms && (
              <section aria-label="Payment terms" className="rounded-xl bg-slate-50 px-4 py-3.5 text-xs leading-relaxed text-slate-500">
                <strong className="text-slate-600">Payment terms:</strong> {quote.paymentTerms}
              </section>
            )}
          </div>
        </main>

        <footer className="mt-5 space-y-1.5 text-center text-xs text-slate-400">
          <p className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            Workmanship guaranteed · Written pricing · No hidden charges
          </p>
          <p>
            Questions? Call{" "}
            <a href={`tel:${phone}`} className="font-semibold text-brand-600">
              {phone}
            </a>{" "}
            and mention quotation {quote.code}.
          </p>
        </footer>
      </div>
    </div>
  );
}
