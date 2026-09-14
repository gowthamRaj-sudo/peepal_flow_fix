import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getJobsForWorker } from "@/server/field-jobs";
import { FieldJobCard } from "@/features/field/field-job-card";
import { FieldLogout } from "@/features/field/field-logout";

export const metadata: Metadata = {
  title: "My Jobs",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export const dynamic = "force-dynamic";

export default async function FieldHomePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/field");

  const [today, upcoming] = await Promise.all([
    getJobsForWorker(session.id, { todayOnly: true }),
    getJobsForWorker(session.id, {
      status: ["SCHEDULED", "IN_PROGRESS"],
    }),
  ]);

  const todayIds = new Set(today.map((j) => j.id));
  const upcomingOnly = upcoming.filter((j) => !todayIds.has(j.id));
  const active = today.filter((j) => j.status !== "COMPLETED" && j.status !== "CANCELLED");
  const doneToday = today.filter((j) => j.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-md px-4 pb-16">
        <header className="flex items-center justify-between py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-400">Peepal Flow Fix</p>
            <h1 className="text-xl font-extrabold text-white">
              Hi {session.name.split(" ")[0]} 👋
            </h1>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1.5 text-sm font-semibold text-accent-300">
            {active.length} to do
          </span>
        </header>

        {active.length === 0 && (
          <div className="mt-10 rounded-2xl bg-slate-800 p-8 text-center">
            <p className="text-4xl" aria-hidden>☕</p>
            <p className="mt-3 text-lg font-bold text-white">No jobs left for today</p>
            <p className="mt-1 text-sm text-slate-400">
              New assignments will appear here the moment the office schedules them.
            </p>
          </div>
        )}

        {active.map((job) => (
          <FieldJobCard key={job.id} job={job} />
        ))}

        {upcomingOnly.length > 0 && (
          <>
            <h2 className="mb-2 mt-8 px-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              Coming up
            </h2>
            {upcomingOnly.slice(0, 5).map((job) => (
              <FieldJobCard key={job.id} job={job} muted />
            ))}
          </>
        )}

        {doneToday.length > 0 && (
          <>
            <h2 className="mb-2 mt-8 px-1 text-xs font-bold uppercase tracking-widest text-emerald-600">
              ✓ Completed today ({doneToday.length})
            </h2>
            {doneToday.map((job) => (
              <FieldJobCard key={job.id} job={job} done />
            ))}
          </>
        )}

        <div className="mt-10 pb-6">
          <FieldLogout />
        </div>
      </div>
    </div>
  );
}
