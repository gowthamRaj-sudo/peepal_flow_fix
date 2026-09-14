import Link from "next/link";
import { ArrowRight, ClipboardList, IndianRupee, Timer, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import {
  formatDateTime,
  LEAD_STATUS_META,
} from "@/features/admin/status-meta";

export const dynamic = "force-dynamic";

function hoursBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 3_600_000;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400_000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalLeads,
    newLeads,
    weeklyLeads,
    completedJobs,
    totalCustomers,
    openQuotes,
    acceptedValue,
    recentLeads,
    contactedAgg,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.customer.count(),
    prisma.quote.count({ where: { status: { in: ["DRAFT", "SENT", "VIEWED"] } } }),
    prisma.quote.aggregate({
      where: { status: "ACCEPTED" },
      _sum: { total: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { service: { select: { name: true } }, area: { select: { name: true } } },
    }),
    prisma.lead.findMany({
      where: { firstContactedAt: { not: null } },
      select: { createdAt: true, firstContactedAt: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const responseTimes = contactedAgg
    .map((l) => (l.firstContactedAt ? hoursBetween(l.createdAt, l.firstContactedAt) : null))
    .filter((v): v is number => v !== null && v >= 0);
  const avgResponseHours =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10
      : null;

  const conversion =
    totalLeads > 0 ? `${Math.round((completedJobs / totalLeads) * 100)}%` : "—";

  const stats = [
    {
      label: "Total enquiries",
      value: String(totalLeads),
      sub: `${newLeads} awaiting first contact`,
      icon: ClipboardList,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      label: "This week",
      value: String(weeklyLeads),
      sub: "new enquiries",
      icon: TrendingUp,
      tone: "bg-accent-50 text-accent-700",
    },
    {
      label: "Jobs completed",
      value: String(completedJobs),
      sub: `${conversion} of all enquiries`,
      icon: TrendingUp,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Avg. response time",
      value: avgResponseHours != null ? `${avgResponseHours}h` : "—",
      sub: "enquiry → first contact",
      icon: Timer,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Accepted quote value",
      value: `₹${Number(acceptedValue._sum.total ?? 0).toLocaleString("en-IN")}`,
      sub: `${openQuotes} quotes in play`,
      icon: IndianRupee,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Customers",
      value: String(totalCustomers),
      sub: "in database",
      icon: ClipboardList,
      tone: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Today at Peepal Flow Fix</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {formatDateTime(todayStart)} · quick health of the business
        </p>
      </header>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.tone}`}>
                <stat.icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{stat.sub}</p>
          </Card>
        ))}
      </section>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Latest enquiries</h2>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            All leads <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul role="list" className="divide-y divide-slate-100">
          {recentLeads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {lead.customerName}
                    <span className="ml-2 font-mono text-xs font-normal text-slate-400">{lead.code}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {lead.service.name} · {lead.area?.name ?? lead.pincode ?? "Chennai"} ·{" "}
                    {formatDateTime(lead.createdAt)}
                  </p>
                </div>
                <Badge tone={LEAD_STATUS_META[lead.status].tone}>
                  {LEAD_STATUS_META[lead.status].label}
                </Badge>
              </Link>
            </li>
          ))}
          {recentLeads.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-slate-400">
              No enquiries yet — they&apos;ll appear here the moment customers submit requests.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
