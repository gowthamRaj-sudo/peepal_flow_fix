import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { formatDateTime, formatDay, LEAD_STATUS_META, JOB_STATUS_META, QUOTE_STATUS_META } from "@/features/admin/status-meta";
import { formatInr } from "@/lib/money";
import type { PaymentMethod, QuoteStatus, JobStatus, LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      area: { select: { name: true, slug: true } },
      leads: {
        orderBy: { createdAt: "desc" as const },
        take: 20,
        include: { service: { select: { name: true } } },
      },
      jobs: {
        orderBy: { createdAt: "desc" as const },
        take: 20,
        include: { service: { select: { name: true } } },
      },
      quotes: {
        orderBy: { createdAt: "desc" as const },
        take: 20,
        select: { id: true, code: true, status: true, total: true, createdAt: true },
      },
      payments: { orderBy: { paidAt: "desc" as const }, take: 20 },
    },
  });
  if (!customer) notFound();

  const lifetimeValue = customer.payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All customers
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer since {formatDay(customer.createdAt)}
            {customer.area ? ` · ${customer.area.name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${customer.phone}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
            <Phone className="h-4 w-4" aria-hidden /> Call
          </a>
          {customer.whatsapp && (
            <a
              href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-800">Details</h2>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div><dt className="text-xs text-slate-400">Phone</dt><dd className="font-semibold text-slate-700">{customer.phone}</dd></div>
            <div><dt className="text-xs text-slate-400">WhatsApp</dt><dd className="text-slate-700">{customer.whatsapp ?? "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Email</dt><dd className="text-slate-700">{customer.email ?? "—"}</dd></div>
            <div><dt className="text-xs text-slate-400">Address</dt><dd className="text-slate-700">{customer.address ?? "—"}{customer.pincode ? `, ${customer.pincode}` : ""}</dd></div>
            <div><dt className="text-xs text-slate-400">Source</dt><dd className="text-slate-700">{customer.source}</dd></div>
            <div><dt className="text-xs text-slate-400">Lifetime value</dt><dd className="font-bold text-emerald-700">{formatInr(lifetimeValue)}</dd></div>
          </dl>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-0">
            <h2 className="border-b border-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-800">
              Enquiries ({customer.leads.length})
            </h2>
            <ul role="list" className="divide-y divide-slate-50">
              {customer.leads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/admin/leads/${lead.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <span className="text-sm text-slate-700">
                      {lead.service.name}
                      <span className="ml-2 font-mono text-xs text-slate-400">{lead.code}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{formatDay(lead.createdAt)}</span>
                      <Badge tone={LEAD_STATUS_META[lead.status as LeadStatus].tone}>
                        {LEAD_STATUS_META[lead.status as LeadStatus].label}
                      </Badge>
                    </span>
                  </Link>
                </li>
              ))}
              {customer.leads.length === 0 && <li className="px-5 py-6 text-sm text-slate-400">No enquiries yet.</li>}
            </ul>
          </Card>

          <Card className="p-0">
            <h2 className="border-b border-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-800">Jobs ({customer.jobs.length})</h2>
            <ul role="list" className="divide-y divide-slate-50">
              {customer.jobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/admin/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <span className="text-sm text-slate-700">{job.title}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{job.scheduledFor ? formatDateTime(job.scheduledFor) : formatDay(job.createdAt)}</span>
                      <Badge tone={JOB_STATUS_META[job.status as JobStatus].tone}>{JOB_STATUS_META[job.status as JobStatus].label}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
              {customer.jobs.length === 0 && <li className="px-5 py-6 text-sm text-slate-400">No jobs yet.</li>}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-0">
              <h2 className="border-b border-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-800">Quotes ({customer.quotes.length})</h2>
              <ul role="list" className="divide-y divide-slate-50">
                {customer.quotes.map((quote) => (
                  <li key={quote.id}>
                    <Link href={`/admin/quotes/${quote.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <span className="text-sm text-slate-700">
                        {quote.code} · {formatInr(Number(quote.total))}
                      </span>
                      <Badge tone={QUOTE_STATUS_META[quote.status as QuoteStatus].tone}>
                        {QUOTE_STATUS_META[quote.status as QuoteStatus].label}
                      </Badge>
                    </Link>
                  </li>
                ))}
                {customer.quotes.length === 0 && <li className="px-5 py-6 text-sm text-slate-400">No quotes yet.</li>}
              </ul>
            </Card>

            <Card className="p-0">
              <h2 className="border-b border-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-800">Payments ({customer.payments.length})</h2>
              <ul role="list" className="divide-y divide-slate-50">
                {customer.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm font-semibold text-emerald-700">{formatInr(Number(p.amount))}</span>
                    <span className="text-xs text-slate-400">{PAYMENT_LABEL[p.method]} · {formatDay(p.paidAt)}</span>
                  </li>
                ))}
                {customer.payments.length === 0 && <li className="px-5 py-6 text-sm text-slate-400">No payments recorded.</li>}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
