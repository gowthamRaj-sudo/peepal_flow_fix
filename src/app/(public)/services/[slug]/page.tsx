import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, MapPin, Route } from "lucide-react";
import { SERVICES_CONTENT } from "@/config/services.data";
import { getActiveAreas } from "@/server/catalog";
import {
  Breadcrumbs,
  FaqAccordion,
  PageHero,
} from "@/components/site/page-parts";
import {
  CallButton,
  RequestServiceButton,
  WhatsAppButton,
} from "@/components/site/cta";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/site/json-ld";
import { BUSINESS, SITE_URL } from "@/config/business";

export const revalidate = 60;

export function generateStaticParams() {
  return SERVICES_CONTENT.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES_CONTENT.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `${SITE_URL}/services/${service.slug}`,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = SERVICES_CONTENT.find((s) => s.slug === slug);
  if (!service) notFound();

  const areas = await getActiveAreas();
  const waMessage = `Hi ${BUSINESS.name}, I need help with ${service.name.toLowerCase()}.`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.metaDescription,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: { "@type": "City", name: "Chennai" },
    url: `${SITE_URL}/services/${service.slug}`,
  };

  return (
    <>
      <JsonLd
        data={[
          serviceSchema,
          faqJsonLd(service.faqs),
          breadcrumbJsonLd([
            { name: "Home", url: SITE_URL },
            { name: "Services", url: `${SITE_URL}/services` },
            { name: service.name, url: `${SITE_URL}/services/${service.slug}` },
          ]),
        ]}
      />

      <Breadcrumbs
        items={[{ name: "Home", href: "/" }, { name: "Services", href: "/services" }, { name: service.name }]}
      />

      <PageHero eyebrow="Service" title={service.name} subtitle={service.tagline}>
        <div className="flex flex-wrap gap-3">
          <RequestServiceButton size="lg" label="Request a Quote" />
          <CallButton size="lg" />
          <WhatsAppButton size="lg" message={waMessage} />
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* Description */}
          <section aria-labelledby="about-service">
            <h2 id="about-service" className="text-xl font-bold text-slate-900">
              About this service
            </h2>
            {service.description.map((para) => (
              <p key={para.slice(0, 32)} className="mt-3 leading-relaxed text-slate-600">
                {para}
              </p>
            ))}
          </section>

          {/* Common problems */}
          <section aria-labelledby="problems">
            <h2 id="problems" className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
              Common problems we solve
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2" role="list">
              {service.commonProblems.map((problem) => (
                <li
                  key={problem}
                  className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 px-3.5 py-2.5 text-sm text-slate-700"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                  {problem}
                </li>
              ))}
            </ul>
          </section>

          {/* What we handle */}
          <section aria-labelledby="handle">
            <h2 id="handle" className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
              What Peepal Flow Fix handles
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2" role="list">
              {service.weHandle.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Process */}
          <section aria-labelledby="process">
            <h2 id="process" className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Route className="h-5 w-5 text-brand-600" aria-hidden />
              Our process
            </h2>
            <ol className="mt-4 space-y-3" role="list">
              {service.process.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-4 shadow-card">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQs */}
          <section aria-labelledby="faqs">
            <h2 id="faqs" className="text-xl font-bold text-slate-900">
              Frequently asked questions
            </h2>
            <div className="mt-4">
              <FaqAccordion faqs={service.faqs} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-5">
            <p className="font-semibold text-brand-900">Need this done at your home?</p>
            <p className="mt-1.5 text-sm text-brand-800/80">
              Book a visit in under two minutes — or just call and talk to us.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <RequestServiceButton size="md" className="w-full justify-center" label="Request a Service" />
              <WhatsAppButton size="md" className="w-full justify-center" message={waMessage} />
            </div>
          </div>

          <nav aria-label="Service areas for this service" className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="flex items-center gap-2 font-semibold text-slate-900">
              <MapPin className="h-4 w-4 text-brand-600" aria-hidden /> We serve this across Chennai
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5" role="list">
              {areas.slice(0, 12).map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/areas/${area.slug}/${service.slug}`}
                    className="inline-flex min-h-[36px] items-center rounded-full bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>

      <section className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="container-page text-center">
          <h2 className="text-xl font-bold text-slate-900">Facing this problem right now?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            The sooner you call, the smaller the repair usually is. We&apos;ll guide you on what to
            do until we arrive.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <CallButton size="xl" label={`Call ${BUSINESS.phone}`} />
            <RequestServiceButton size="xl" />
          </div>
        </div>
      </section>
    </>
  );
}
