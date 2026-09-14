import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, CheckCircle2, AlertTriangle, Route } from "lucide-react";
import { SERVICES_CONTENT } from "@/config/services.data";
import { PageHero } from "@/components/site/page-parts";
import { RequestServiceButton } from "@/components/site/cta";
import { SectionHeading } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Home Services in Chennai — Plumbing, Electrical, Bathrooms",
  description:
    "All Peepal Flow Fix home services: plumbing, electrical work, bathroom fittings, new bathrooms, renovation, alteration, water leakage repair and home maintenance across Chennai.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Every home service your Chennai home needs"
        subtitle="One experienced team for plumbing, electricals and everything bathroom. Click any service to see exactly what we handle."
      >
        <RequestServiceButton size="lg" />
      </PageHero>

      <section className="container-page py-12">
        <ul className="grid gap-4 md:grid-cols-2" role="list">
          {SERVICES_CONTENT.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <Wrench className="h-7 w-7 text-brand-600" aria-hidden />
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Available now
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-brand-700">
                  {service.name}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">{service.tagline}</p>

                <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                    Fixes: {service.commonProblems.slice(0, 2).join(" · ").toLowerCase()}
                  </p>
                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <Route className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
                    {service.process.length}-step process · written quotation
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                  View service details →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="container-page text-center">
          <SectionHeading
            title="Not sure which service you need?"
            subtitle="Describe the problem in your own words — we'll figure out the right fix during the visit."
          />
          <div className="mt-6 flex justify-center">
            <RequestServiceButton size="xl" label="Describe Your Problem" />
          </div>
        </div>
      </section>
    </>
  );
}
