import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { leadsService } from "@/server/leads.service";
import { allowedNextLeadStatuses } from "@/domain/lead-status";
import { Badge } from "@/components/ui/card";
import { formatDateTime, LEAD_STATUS_META } from "@/features/admin/status-meta";
import { LeadActions } from "@/features/admin/lead-actions";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await getSession();

  let lead;
  try {
    lead = await leadsService.getLeadForAdmin(id);
  } catch {
    notFound();
  }

  const workers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const nextStatuses = allowedNextLeadStatuses(lead.status).map((s) => ({
    value: s,
    label: LEAD_STATUS_META[s].label,
  }));

  return (
    <div className="space-y-4">
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All leads
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {lead.customerName}{" "}
            <span className="ml-1 font-mono text-sm font-medium text-slate-400">{lead.code}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {lead.service.name}
            {lead.area ? ` · ${lead.area.name}` : ""} · received {formatDateTime(lead.createdAt)}
          </p>
        </div>
        <Badge tone={LEAD_STATUS_META[lead.status].tone}>
          {LEAD_STATUS_META[lead.status].label}
        </Badge>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: details */}
        <div className="space-y-4 lg:col-span-3">
          <section aria-label="Contact details" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-800">Customer</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Phone</dt>
                <dd>
                  <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800">
                    <Phone className="h-3.5 w-3.5" aria-hidden /> {lead.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">WhatsApp</dt>
                <dd className="font-semibold text-slate-700">{lead.whatsapp ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Email</dt>
                <dd className="text-slate-700">{lead.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Preferred time</dt>
                <dd className="capitalize text-slate-700">{lead.preferredTime.toLowerCase()}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">Address</dt>
                <dd className="text-slate-700">
                  {lead.address ?? "—"}
                  {lead.pincode ? `, ${lead.pincode}` : ""}
                </dd>
              </div>
            </dl>
            {lead.customerId && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                Linked customer:{" "}
                <Link href={`/admin/customers/${lead.customerId}`} className="font-semibold text-brand-600 hover:text-brand-700">
                  View full history →
                </Link>
              </p>
            )}
          </section>

          <section aria-label="Problem description" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-800">Problem description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {lead.description ?? "—"}
            </p>
            {(lead.utmSource || lead.utmCampaign || lead.landingPage) && (
              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-4">
                <div><dt className="text-slate-400">Source</dt><dd className="font-medium text-slate-600">{lead.utmSource ?? "direct"}</dd></div>
                <div><dt className="text-slate-400">Medium</dt><dd className="font-medium text-slate-600">{lead.utmMedium ?? "—"}</dd></div>
                <div><dt className="text-slate-400">Campaign</dt><dd className="font-medium text-slate-600">{lead.utmCampaign ?? "—"}</dd></div>
                <div><dt className="text-slate-400">Landing page</dt><dd className="truncate font-medium text-slate-600">{lead.landingPage ?? "—"}</dd></div>
              </dl>
            )}
          </section>

          <section aria-label="Uploaded photos" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Camera className="h-4 w-4 text-slate-500" aria-hidden />
              Customer uploads ({lead.uploads.length})
            </h2>
            {lead.uploads.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No photos were attached.</p>
            ) : (
              <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" role="list">
                {lead.uploads.map((u) => (
                  <li key={u.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/files/${encodeURIComponent(u.key)}`}
                      alt={`Upload ${u.filename}`}
                      loading="lazy"
                      className="aspect-square w-full rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Internal notes" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-800">Notes timeline</h2>
            {lead.notes.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No notes yet.</p>
            ) : (
              <ul role="list" className="mt-3 space-y-3">
                {lead.notes.map((note) => (
                  <li key={note.id} className="rounded-lg bg-slate-50 px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{note.body}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {note.author?.name ?? "System"} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: actions + linked records */}
        <div className="space-y-4 lg:col-span-2">
          <LeadActions
            leadId={lead.id}
            status={lead.status}
            nextStatuses={nextStatuses}
            assignedToId={lead.assignedTo?.id ?? null}
            workers={workers}
            visitAt={lead.visitAt ? lead.visitAt.toISOString() : null}
            hasJob={lead.jobs.length > 0}
          />

          {(lead.jobs.length > 0 || lead.quotes.length > 0) && (
            <section aria-label="Linked records" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-sm font-semibold text-slate-800">Linked records</h2>
              <ul role="list" className="mt-3 space-y-2 text-sm">
                {lead.jobs.map((job) => (
                  <li key={job.id}>
                    <Link href={`/admin/jobs/${job.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                      Job {job.code} — {job.status.toLowerCase()}
                    </Link>
                  </li>
                ))}
                {lead.quotes.map((q) => (
                  <li key={q.id}>
                    <Link href={`/admin/quotes/${q.id}`} className="font-medium text-brand-600 hover:text-brand-700">
                      Quote {q.code} — ₹{Number(q.total).toLocaleString("en-IN")}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label="Visit schedule" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-slate-800">Visit</h2>
            <p className="mt-2 text-sm text-slate-600">{formatDateTime(lead.visitAt)}</p>
            <p className="mt-1 text-xs text-slate-400">
              First contacted: {formatDateTime(lead.firstContactedAt)}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
