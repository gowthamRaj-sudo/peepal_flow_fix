import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { getSession } from "@/lib/auth";
import { mapsUrlFor } from "@/lib/maps";
import { jobsService } from "@/server/jobs.service";
import { FieldJobButtons } from "@/features/field/field-job-buttons";
import { formatDateTime } from "@/features/admin/status-meta";

export const dynamic = "force-dynamic";

export default async function FieldJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/field");
  if (!["FIELD_WORKER", "ADMIN", "STAFF"].includes(session.role)) redirect("/admin");

  const job = await jobsService.getJobForRole(
    id,
    session.role === "FIELD_WORKER" ? "FIELD_WORKER" : "STAFF",
    session.id,
  );

  const before = job.photos.filter((p) => p.stage === "BEFORE");
  const after = job.photos.filter((p) => p.stage === "AFTER");
  const mapsUrl = mapsUrlFor(job.address ?? job.customer.address, job.area?.name);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-md px-4 pb-16">
        <div className="flex items-center gap-3 py-4">
          <Link
            href="/field"
            aria-label="Back to my jobs"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <p className="text-sm font-bold uppercase tracking-widest text-brand-400">Job details</p>
        </div>

        {/* Customer header — call first */}
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-2xl font-extrabold text-slate-900">{job.customer.name}</p>
          <p className="mt-1 font-semibold text-slate-600">{job.title}</p>
          <p className="mt-2 text-sm text-slate-500">
            {formatDateTime(job.scheduledFor)} · {job.area?.name ?? "Chennai"}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href={`tel:${job.customer.phone}`}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-brand-600 text-base font-bold text-white active:bg-brand-700"
            >
              <Phone className="h-5 w-5" aria-hidden /> Call
            </a>
            {job.customer.whatsapp && (
              <a
                href={`https://wa.me/${job.customer.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${job.customer.name}, this is Peepal Flow Fix regarding your ${job.service.name} visit.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700"
              >
                <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Address + notes */}
        <section className="mt-3 rounded-2xl bg-slate-800 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Address</p>
          <p className="mt-1.5 leading-relaxed text-slate-200">
            {job.address ?? job.customer.address ?? "— call customer for directions —"}
          </p>
          {job.notes && (
            <>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Office notes
              </p>
              <p className="mt-1.5 whitespace-pre-wrap leading-relaxed text-amber-300">
                {job.notes}
              </p>
            </>
          )}
          {job.customer.whatsapp && job.customer.whatsapp !== job.customer.phone && (
            <p className="mt-4 text-xs text-slate-500">Alternate WhatsApp: {job.customer.whatsapp}</p>
          )}
        </section>

        {/* Photos taken so far */}
        {(before.length > 0 || after.length > 0) && (
          <section className="mt-3 grid grid-cols-2 gap-3">
            {before.length > 0 && (
              <div className="rounded-2xl bg-slate-800 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Before ({before.length})
                </p>
                <ul role="list" className="grid grid-cols-2 gap-2">
                  {before.map((photo) => (
                    <li key={photo.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/files/${encodeURIComponent(photo.storageKey)}`}
                        alt="Before work"
                        loading="lazy"
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {after.length > 0 && (
              <div className="rounded-2xl bg-slate-800 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                  After ({after.length})
                </p>
                <ul role="list" className="grid grid-cols-2 gap-2">
                  {after.map((photo) => (
                    <li key={photo.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/files/${encodeURIComponent(photo.storageKey)}`}
                        alt="After work"
                        loading="lazy"
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Action buttons */}
        <div className="mt-4">
          <FieldJobButtons
            jobId={job.id}
            status={job.status}
            photoCounts={{ before: before.length, after: after.length }}
            mapsUrl={mapsUrl}
          />
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-slate-600">{job.code}</p>
      </div>
    </div>
  );
}
