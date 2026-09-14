import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { LEAD_STATUS_META, formatDateTime } from "@/features/admin/status-meta";
import { LeadStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "All open" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "VISIT_SCHEDULED", label: "Visit scheduled" },
  { value: "QUOTATION_SENT", label: "Quote sent" },
  { value: "JOB_SCHEDULED", label: "Job scheduled" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "LOST", label: "Lost" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status;
  const q = sp.q?.trim();
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const pageSize = 25;

  const where: Prisma.LeadWhereInput = {};
  if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
    where.status = status as LeadStatus;
  } else if (!status) {
    where.status = { notIn: ["COMPLETED", "CANCELLED", "LOST"] as LeadStatus[] };
  }
  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        service: { select: { name: true } },
        area: { select: { name: true } },
        assignedTo: { select: { name: true } },
        _count: { select: { uploads: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">{total} enquiries</p>
        </div>
        <form action="/admin/leads" method="get" className="flex min-h-[44px] gap-2">
          <input type="hidden" name="status" value={status ?? ""} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, FC-code…"
            aria-label="Search leads"
            className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Search
          </button>
        </form>
      </header>

      <nav aria-label="Filter by status" className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const active = (sp.status ?? "") === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/leads?${tab.value ? `status=${tab.value}` : ""}${q ? `${tab.value ? "&" : ""}q=${encodeURIComponent(q)}` : ""}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                active ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <Card>
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-5 py-3 font-medium">Lead</th>
                <th scope="col" className="px-5 py-3 font-medium">Service / Area</th>
                <th scope="col" className="px-5 py-3 font-medium">Preferred</th>
                <th scope="col" className="px-5 py-3 font-medium">Assigned</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <span className="font-semibold text-slate-800">{lead.customerName}</span>
                      <span className="ml-2 block font-mono text-xs text-slate-400">{lead.code}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-slate-700">{lead.service.name}</span>
                    <span className="block text-xs text-slate-400">
                      {lead.area?.name ?? lead.pincode ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 capitalize text-slate-600">{lead.preferredTime.toLowerCase()}</td>
                  <td className="px-5 py-3 text-slate-600">{lead.assignedTo?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={LEAD_STATUS_META[lead.status].tone}>
                      {LEAD_STATUS_META[lead.status].label}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDateTime(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul role="list" className="divide-y divide-slate-100 md:hidden">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link href={`/admin/leads/${lead.id}`} className="block px-4 py-3.5 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">{lead.customerName}</span>
                  <Badge tone={LEAD_STATUS_META[lead.status].tone}>
                    {LEAD_STATUS_META[lead.status].label}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  {lead.service.name} · {lead.area?.name ?? lead.pincode ?? "—"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatDateTime(lead.createdAt)} · {lead._count.uploads} photos
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {leads.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-slate-400">No leads match this view.</p>
        )}
      </Card>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/leads?page=${p}${status ? `&status=${status}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`min-h-[40px] rounded-lg px-3.5 py-2 text-sm font-semibold ${
                p === page ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
