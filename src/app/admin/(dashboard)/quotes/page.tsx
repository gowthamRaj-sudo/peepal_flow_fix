import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { formatDay, QUOTE_STATUS_META } from "@/features/admin/status-meta";
import { formatInr } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quotations</h1>
          <p className="text-sm text-slate-500">{quotes.length} shown</p>
        </div>
        <Link href="/admin/quotes/new" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          + New quotation
        </Link>
      </header>

      <Card>
        <ul role="list" className="divide-y divide-slate-100">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <Link href={`/admin/quotes/${quote.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {quote.code}
                    <span className="ml-2 font-medium">{quote.customer.name}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {quote.service?.name ?? "—"} · created {formatDay(quote.createdAt)}
                    {quote.validUntil ? ` · valid till ${formatDay(quote.validUntil)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{formatInr(Number(quote.total))}</span>
                  <Badge tone={QUOTE_STATUS_META[quote.status].tone}>{QUOTE_STATUS_META[quote.status].label}</Badge>
                </div>
              </Link>
            </li>
          ))}
          {quotes.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-slate-400">
              No quotations yet.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
