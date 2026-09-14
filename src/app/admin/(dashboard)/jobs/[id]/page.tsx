import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Camera, FileSignature } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jobsService } from "@/server/jobs.service";
import { Card, Badge } from "@/components/ui/card";
import { formatDateTime, JOB_STATUS_META, QUOTE_STATUS_META } from "@/features/admin/status-meta";
import { formatInr } from "@/lib/money";
import { JobAdminActions } from "@/features/admin/job-admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();

  const job = await jobsService.getJobForRole(id, session.role === "FIELD_WORKER" ? "FIELD_WORKER" : "STAFF", session.id);

  const workers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true },
    orderBy: [{ role: "asc" as const }, { name: "asc" as const }],
  });

  const beforePhotos = job.photos.filter((p) => p.stage === "BEFORE");
  const duringPhotos = job.photos.filter((p) => p.stage === "DURING");
  const afterPhotos = job.photos.filter((p) => p.stage === "AFTER");

  return (
    <div className="space-y-4">
      <Link href="/admin/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All jobs
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {job.title}
            <span className="ml-2 font-mono text-sm font-medium text-slate-400">{job.code}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {job.customer.name} · scheduled {formatDateTime(job.scheduledFor)} · assigned to{" "}
            {job.assignedTo?.name ?? "nobody yet"}
          </p>
        </div>
        <Badge tone={JOB_STATUS_META[job.status].tone}>{JOB_STATUS_META[job.status].label}</Badge>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section aria-label="Job details" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-800">Details</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-400">Service</dt><dd className="text-slate-700">{job.service.name}</dd></div>
              <div><dt className="text-xs text-slate-400">Area</dt><dd className="text-slate-700">{job.area?.name ?? "—"}</dd></div>
              <div>
                <dt className="text-xs text-slate-400">Customer phone</dt>
                <dd>
                  <a href={`tel:${job.customer.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-brand-700">
                    <Phone className="h-3.5 w-3.5" aria-hidden /> {job.customer.phone}
                  </a>
                </dd>
              </div>
              <div><dt className="text-xs text-slate-400">Started / completed</dt><dd className="text-slate-700">{formatDateTime(job.startedAt)} → {formatDateTime(job.completedAt)}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">Address</dt>
                <dd className="inline-flex items-start gap-1.5 text-slate-700">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
                  <span>{job.address ?? job.customer.address ?? "—"}</span>
                </dd>
              </div>
              {job.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-400">Notes</dt>
                  <dd className="whitespace-pre-wrap text-slate-600">{job.notes}</dd>
                </div>
              )}
            </dl>
          </section>

          <section aria-label="Job photos" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Camera className="h-4 w-4 text-slate-500" aria-hidden /> Photos
            </h2>
            {(["BEFORE", "DURING", "AFTER"] as const).map((stage) => {
              const photos =
                stage === "BEFORE" ? beforePhotos : stage === "DURING" ? duringPhotos : afterPhotos;
              return (
                <div key={stage} className="mt-4 first:mt-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{stage}</p>
                  {photos.length === 0 ? (
                    <p className="mt-1.5 text-xs text-slate-400">None uploaded.</p>
                  ) : (
                    <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5" role="list">
                      {photos.map((photo) => (
                        <li key={photo.id}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/files/${encodeURIComponent(photo.storageKey)}`}
                            alt={`${stage.toLowerCase()} photo`}
                            loading="lazy"
                            className="aspect-square w-full rounded-lg object-cover ring-1 ring-slate-200"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        </div>

        <div className="space-y-4">
          <JobAdminActions
            jobId={job.id}
            status={job.status}
            assignedToId={job.assignedToId}
            workers={workers}
          />

          <section aria-label="Quotes for this job" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <FileSignature className="h-4 w-4 text-accent-600" aria-hidden /> Quotes
            </h2>
            <ul role="list" className="mt-3 space-y-2 text-sm">
              {job.quotes.map((q) => (
                <li key={q.id} className="flex items-center justify-between">
                  <Link href={`/admin/quotes/${q.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                    {q.code}
                  </Link>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{formatInr(Number(q.total))}</span>
                    <Badge tone={QUOTE_STATUS_META[q.status].tone}>{QUOTE_STATUS_META[q.status].label}</Badge>
                  </span>
                </li>
              ))}
              {job.quotes.length === 0 && <li className="text-xs text-slate-400">No quotes linked.</li>}
            </ul>
            <Link
              href={`/admin/quotes/new?${new URLSearchParams({ jobId: job.id, leadId: job.leadId ?? "" }).toString()}`}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-accent-500 px-4 text-sm font-semibold text-white hover:bg-accent-600"
            >
              + New quotation
            </Link>
          </section>

          <section aria-label="Customer record" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-800">Customer</h2>
            <Link href={`/admin/customers/${job.customerId}`} className="mt-2 inline-block font-semibold text-brand-600 hover:text-brand-700">
              View full history →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
