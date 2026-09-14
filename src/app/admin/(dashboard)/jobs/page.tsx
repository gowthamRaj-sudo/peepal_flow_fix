import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { formatDateTime, JOB_STATUS_META } from "@/features/admin/status-meta";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const status = (await searchParams).status;
  const where: Prisma.JobWhereInput =
    status === "SCHEDULED" || status === "IN_PROGRESS" || status === "COMPLETED" || status === "CANCELLED"
      ? { status }
      : {};

  const jobs = await prisma.job.findMany({
    where,
    orderBy: [{ scheduledFor: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      customer: { select: { name: true, phone: true } },
      service: { select: { name: true } },
      area: { select: { name: true } },
      assignedTo: { select: { name: true } },
      _count: { select: { photos: true } },
    },
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jobs</h1>
          <p className="text-sm text-slate-500">{jobs.length} shown</p>
        </div>
        <nav aria-label="Filter jobs" className="flex gap-1.5 overflow-x-auto">
          {[
            ["", "All"],
            ["SCHEDULED", "Scheduled"],
            ["IN_PROGRESS", "In progress"],
            ["COMPLETED", "Completed"],
            ["CANCELLED", "Cancelled"],
          ].map(([value, label]) => (
            <Link
              key={value}
              href={value ? `/admin/jobs?status=${value}` : "/admin/jobs"}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                (status ?? "") === value ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <Card>
        <ul role="list" className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link href={`/admin/jobs/${job.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {job.title}
                    <span className="ml-2 font-mono text-xs font-normal text-slate-400">{job.code}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {job.customer.name} · {job.service.name} · {job.area?.name ?? "Chennai"} ·{" "}
                    {formatDateTime(job.scheduledFor)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{job._count.photos} photos</span>
                  <Badge tone={JOB_STATUS_META[job.status].tone}>{JOB_STATUS_META[job.status].label}</Badge>
                </div>
              </Link>
            </li>
          ))}
          {jobs.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-slate-400">
              No jobs yet. Convert an approved lead into a job from the lead page.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
