import type { Metadata } from "next";
import { Clock3, Camera, FileText } from "lucide-react";
import { getActiveAreas, getActiveServices } from "@/server/catalog";
import { LeadForm } from "@/features/leads/lead-form";

export const metadata: Metadata = {
  title: "Request a Service — Fast Response Across Chennai",
  description:
    "Request plumbing, electrical or bathroom services in Chennai. Two-minute form with photo upload. Same-day visits usually available.",
  alternates: { canonical: "/request-service" },
};

export default async function RequestServicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [services, areas, sp] = await Promise.all([
    getActiveServices(),
    getActiveAreas(),
    searchParams,
  ]);

  const presetServiceSlug = typeof sp.service === "string" ? sp.service : undefined;
  const utm: Record<string, string> = { landing_page: "/request-service" };
  for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
    const value = sp[key];
    if (typeof value === "string") utm[key] = value;
  }

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page max-w-2xl py-10 sm:py-14">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Request a service visit
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Takes under two minutes. The more we know before arriving, the faster we fix it.
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <li className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-brand-600" aria-hidden /> Quick response
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-brand-600" aria-hidden /> Photo upload
            </li>
            <li className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-brand-600" aria-hidden /> Written quote
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <LeadForm
            services={services.map((s) => ({ slug: s.slug, name: s.name }))}
            areas={areas.map((a) => ({ slug: a.slug, name: a.name }))}
            presetServiceSlug={presetServiceSlug}
            presetUtm={utm}
          />
        </div>
      </div>
    </div>
  );
}
