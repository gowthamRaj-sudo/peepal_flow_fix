import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { formatDateTime, formatDay, QUOTE_STATUS_META, JOB_STATUS_META } from "@/features/admin/status-meta";
import { formatInr } from "@/lib/money";
import { QuoteActions } from "@/features/admin/quote-actions";
import type { QuoteItemKind } from "@prisma/client";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<QuoteItemKind, string> = {
  MATERIALS: "Materials",
  LABOUR: "Labour",
  OTHER: "Other",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      customer: true,
      service: true,
      job: { select: { id: true, code: true, status: true } },
    },
  });
  if (!quote) notFound();

  return (
    <div className="space-y-4">
      <Link href="/admin/quotes" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        ← All quotations
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {quote.code}
            <span className="ml-2 font-medium text-slate-500">{quote.customer.name}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Created {formatDay(quote.createdAt)}
            {quote.sentAt ? ` · sent ${formatDay(quote.sentAt)}` : ""}
            {quote.viewedAt ? ` · viewed ${formatDay(quote.viewedAt)}` : ""}
          </p>
        </div>
        <Badge tone={QUOTE_STATUS_META[quote.status].tone}>{QUOTE_STATUS_META[quote.status].label}</Badge>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          {/* Preview of what customer sees */}
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Customer view
          </div>
          <div className="p-5">
            {quote.workDescription && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Scope of work</h3>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{quote.workDescription}</p>
              </div>
            )}
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th scope="col" className="py-2 font-medium">Item</th>
                  <th scope="col" className="py-2 text-right font-medium">Qty</th>
                  <th scope="col" className="py-2 text-right font-medium">Rate</th>
                  <th scope="col" className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-3">
                      <span className="text-slate-800">{item.description}</span>
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                        {KIND_LABEL[item.kind]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right text-slate-600">{Number(item.quantity)} {item.unit}</td>
                    <td className="whitespace-nowrap py-2.5 text-right text-slate-600">{formatInr(Number(item.unitPrice))}</td>
                    <td className="whitespace-nowrap py-2.5 text-right font-medium text-slate-800">{formatInr(Number(item.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="ml-auto mt-4 max-w-[240px] space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatInr(Number(quote.subtotal))}</dd></div>
              {Number(quote.discount) > 0 && (
                <div className="flex justify-between"><dt className="text-slate-500">Discount</dt><dd>− {formatInr(Number(quote.discount))}</dd></div>
              )}
              {Number(quote.taxPercent) > 0 && (
                <div className="flex justify-between"><dt className="text-slate-500">Tax ({Number(quote.taxPercent)}%)</dt><dd>{formatInr(Number(quote.taxAmount))}</dd></div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-brand-700">
                <dt>Total</dt><dd>{formatInr(Number(quote.total))}</dd>
              </div>
            </dl>

            {quote.paymentTerms && (
              <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                <strong className="text-slate-600">Payment terms:</strong> {quote.paymentTerms}
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <QuoteActions quoteId={quote.id} status={quote.status} publicToken={quote.publicToken} />

          <section aria-label="Quote metadata" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-800">Details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-xs text-slate-400">Valid until</dt><dd>{formatDay(quote.validUntil)}</dd></div>
              <div><dt className="text-xs text-slate-400">Customer</dt><dd><Link href={`/admin/customers/${quote.customerId}`} className="font-medium text-brand-600">{quote.customer.name} →</Link></dd></div>
              {quote.job && (
                <div>
                  <dt className="text-xs text-slate-400">Linked job</dt>
                  <dd className="flex items-center gap-2">
                    <Link href={`/admin/jobs/${quote.job.id}`} className="font-medium text-brand-600">{quote.job.code}</Link>
                    <Badge tone={JOB_STATUS_META[quote.job.status].tone}>{JOB_STATUS_META[quote.job.status].label}</Badge>
                  </dd>
                </div>
              )}
              <div><dt className="text-xs text-slate-400">Accepted at</dt><dd>{formatDateTime(quote.acceptedAt)}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
