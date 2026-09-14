import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Badge, PanelHeading } from "@/components/ui/card";
import { formatInr } from "@/lib/money";
import { LEAD_STATUS_META } from "@/features/admin/status-meta";

export const metadata: Metadata = {
  title: "Marketing",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function pct(part: number, whole: number): string {
  if (whole === 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!["ADMIN", "STAFF"].includes(session.role)) redirect("/field");

  const since30 = new Date(Date.now() - 30 * 86400_000);
  const since90 = new Date(Date.now() - 90 * 86400_000);

  const [
    bySource,
    byArea,
    byService,
    statusCounts,
    last30,
    wonQuotes,
    lostQuotes,
    eventCounts,
    topUtm,
  ] = await Promise.all([
    prisma.lead.groupBy({
      by: ["source"],
      _count: { _all: true },
      where: { createdAt: { gte: since90 } },
      orderBy: { _count: { source: "desc" } },
    }),
    prisma.lead.groupBy({
      by: ["areaId"],
      _count: { _all: true },
      where: { createdAt: { gte: since90 }, areaId: { not: null } },
      orderBy: { _count: { areaId: "desc" } },
      take: 10,
    }),
    prisma.lead.groupBy({
      by: ["serviceId"],
      _count: { _all: true },
      where: { createdAt: { gte: since90 } },
      orderBy: { _count: { serviceId: "desc" } },
      take: 8,
    }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.count({ where: { createdAt: { gte: since30 } } }),
    prisma.quote.aggregate({
      where: { status: "ACCEPTED", createdAt: { gte: since90 } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.quote.aggregate({
      where: { status: { in: ["REJECTED", "EXPIRED"] }, createdAt: { gte: since90 } },
      _count: { _all: true },
    }),
    prisma.eventLog.groupBy({
      by: ["name"],
      _count: { _all: true },
      where: { createdAt: { gte: since30 } },
      orderBy: { _count: { name: "desc" } },
      take: 8,
    }),
    prisma.lead.groupBy({
      by: ["utmCampaign", "utmSource"],
      _count: { _all: true },
      where: { createdAt: { gte: since90 }, utmCampaign: { not: null } },
      orderBy: { _count: { utmCampaign: "desc" } },
      take: 6,
    }),
  ]);

  const [areas, services] = await Promise.all([
    prisma.serviceArea.findMany({ select: { id: true, name: true } }),
    prisma.service.findMany({ select: { id: true, name: true } }),
  ]);
  const areaName = new Map(areas.map((a) => [a.id, a.name]));
  const serviceName = new Map(services.map((s) => [s.id, s.name]));

  const totalLeads90 = bySource.reduce((sum, r) => sum + r._count._all, 0);
  const totalLeadsAll = statusCounts.reduce((s, r) => s + r._count._all, 0);
  const wonCount = statusCounts.find((s) => s.status === "COMPLETED")?._count._all ?? 0;
  const quoteWinRate =
    wonQuotes._count._all + lostQuotes._count._all === 0
      ? null
      : Math.round((wonQuotes._count._all / (wonQuotes._count._all + lostQuotes._count._all)) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Where enquiries come from and what turns them into work.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Leads · last 30 days", value: String(last30) },
          {
            label: "Completed · all time",
            value: String(wonCount),
            sub: `${pct(wonCount, totalLeadsAll)} of all leads`,
          },
          {
            label: "Accepted quotes · 90d",
            value: formatInr(Number(wonQuotes._sum.total ?? 0)),
            sub: `win rate ${quoteWinRate !== null ? `${quoteWinRate}%` : "—"}`,
          },
          {
            label: "Avg quote value",
            value:
              wonQuotes._count._all > 0
                ? formatInr(Number(wonQuotes._sum.total ?? 0) / wonQuotes._count._all)
                : "—",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{card.value}</p>
            {card.sub && <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>}
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Leads by source">
          <PanelHeading title="Leads by source" hint="last 90 days" />
          <ul role="list" className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {bySource.length === 0 && <li className="px-4 py-3 text-sm text-slate-400">No leads yet</li>}
            {bySource.map((row) => (
              <li key={row.source} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium capitalize text-slate-700">{row.source.replace(/_/g, " ").toLowerCase()}</span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-400">{pct(row._count._all, totalLeads90)}</span>
                  <span className="font-bold tabular-nums text-slate-900">{row._count._all}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Leads by area">
          <PanelHeading title="Top areas" hint="last 90 days" />
          <ul role="list" className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {byArea.length === 0 && <li className="px-4 py-3 text-sm text-slate-400">No data yet</li>}
            {byArea.map((row) => (
              <li key={row.areaId} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">{areaName.get(row.areaId!) ?? row.areaId}</span>
                <span className="font-bold tabular-nums text-slate-900">{row._count._all}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Leads by service">
          <PanelHeading title="Top services" hint="last 90 days" />
          <ul role="list" className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {byService.map((row) => (
              <li key={row.serviceId} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">{serviceName.get(row.serviceId) ?? row.serviceId}</span>
                <span className="flex items-center gap-3">
                  <Badge tone={LEAD_STATUS_META.COMPLETED.tone}>{pct(row._count._all, totalLeads90)} of leads</Badge>
                  <span className="font-bold tabular-nums text-slate-900">{row._count._all}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Pipeline snapshot">
          <PanelHeading title="Pipeline snapshot" hint="all time" />
          <ul role="list" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(LEAD_STATUS_META) as (keyof typeof LEAD_STATUS_META)[]).map((status) => (
              <li key={status} className="rounded-xl border border-slate-200 bg-white p-4">
                <Badge tone={LEAD_STATUS_META[status].tone}>{LEAD_STATUS_META[status].label}</Badge>
                <p className="mt-2 text-xl font-extrabold tabular-nums text-slate-900">
                  {statusCounts.find((s) => s.status === status)?._count._all ?? 0}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Website events">
          <PanelHeading title="Website activity" hint="last 30 days" />
          <ul role="list" className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {eventCounts.length === 0 && <li className="px-4 py-3 text-sm text-slate-400">No tracked events yet</li>}
            {eventCounts.map((row) => (
              <li key={row.name} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-mono text-xs font-medium text-slate-600">{row.name}</span>
                <span className="font-bold tabular-nums text-slate-900">{row._count._all}</span>
              </li>
            ))}
          </ul>
        </section>

        {topUtm.length > 0 && (
          <section aria-label="Campaign performance">
            <PanelHeading title="Campaigns (UTM)" hint="last 90 days" />
            <ul role="list" className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {topUtm.map((row, i) => (
                <li key={`${row.utmCampaign}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-slate-700">
                    {row.utmCampaign}
                    {row.utmSource && <span className="ml-1.5 text-xs text-slate-400">/ {row.utmSource}</span>}
                  </span>
                  <span className="font-bold tabular-nums text-slate-900">{row._count._all}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
