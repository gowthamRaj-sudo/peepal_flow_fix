import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
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
import { breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/components/site/json-ld";
import { BUSINESS, SITE_URL } from "@/config/business";

export const revalidate = 3600;

const AREA_FAQS = [
  {
    q: `Do you charge extra for visits in this area?`,
    a: "Visit charges are transparent and shared before booking. For most repair jobs the inspection amount is adjusted against the final bill when you proceed with the work.",
  },
  {
    q: "How quickly can you visit my home?",
    a: "Most requests in our service areas get a same-day or next-morning slot. Morning and evening slots fill first — book early or call us directly.",
  },
  {
    q: "Do you work in apartments and gated communities?",
    a: "Yes. Apartment work is a large part of what we do. Share your community's technician entry timing while booking and we'll plan accordingly.",
  },
];

export function generateStaticParams() {
  return [];
}

async function getArea(slug: string) {
  try {
    return await prisma.serviceArea.findUnique({
      where: { slug },
      include: {
        services: {
          where: { service: { isActive: true } },
          select: { service: { select: { slug: true, name: true } } },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await getArea(slug);
  if (!area || !area.isActive) return {};
  return {
    title: `${area.name} Home Services | Plumber & Bathroom Experts`,
    description: `Plumbing, electrical, bathroom renovation and leakage repair services in ${area.name}, Chennai by ${BUSINESS.name}. 25+ years experience. Book a same-day visit online.`,
    alternates: { canonical: `/areas/${area.slug}` },
    openGraph: {
      title: `${BUSINESS.name} in ${area.name}`,
      description: `Experienced plumbing and bathroom services in ${area.name}.`,
      url: `${SITE_URL}/areas/${area.slug}`,
    },
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = await getArea(slug);
  if (!area || !area.isActive) notFound();

  const waMessage = `Hi ${BUSINESS.name}, I need a home service visit in ${area.name}.`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: `${BUSINESS.name} — ${area.name}`,
      parentOrganization: { "@id": `${SITE_URL}/#business` },
      url: `${SITE_URL}/areas/${area.slug}`,
      areaServed: { "@type": "Place", name: `${area.name}, Chennai` },
      telephone: BUSINESS.phone,
      priceRange: BUSINESS.priceRange,
    },
    faqJsonLd(AREA_FAQS),
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Service Areas", url: `${SITE_URL}/areas` },
      { name: area.name, url: `${SITE_URL}/areas/${area.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Service Areas", href: "/areas" },
          { name: area.name },
        ]}
      />

      <PageHero
        eyebrow="Service area"
        title={`Trusted home services in ${area.name}`}
        subtitle={area.context ?? undefined}
      >
        <div className="flex flex-wrap gap-3">
          <RequestServiceButton size="lg" label={`Request Service in ${area.name}`} />
          <CallButton size="lg" />
          <WhatsAppButton size="lg" message={waMessage} />
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section aria-labelledby="services-in-area">
            <h2 id="services-in-area" className="text-xl font-bold text-slate-900">
              Services available in {area.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Every service below is actively offered here, handled by our regular teams — not
              referred out to strangers.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2" role="list">
              {area.services.map(({ service }) => (
                <li key={service.slug}>
                  <Link
                    href={`/areas/${area.slug}/${service.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-300"
                  >
                    <span className="font-semibold text-slate-900 group-hover:text-brand-700">
                      {service.name}
                    </span>
                    <span className="mt-1 text-xs font-medium text-brand-600">
                      Details &amp; pricing guidance →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="common-problems-area">
            <h2 id="common-problems-area" className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
              What we&apos;re most often called for in {area.name}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700" role="list">
              <li className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 px-4 py-3">
                Bathroom leakage and seepage complaints that previous repairs didn&apos;t solve
              </li>
              <li className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 px-4 py-3">
                Complete renovation of ageing bathrooms in older independent homes
              </li>
              <li className="flex items-start gap-2.5 rounded-lg bg-amber-50/60 px-4 py-3">
                New fittings installation in recently handed-over apartments
              </li>
            </ul>
          </section>

          <section aria-labelledby="faq-area">
            <h2 id="faq-area" className="text-xl font-bold text-slate-900">
              Common questions about service in {area.name}
            </h2>
            <div className="mt-4">
              <FaqAccordion faqs={AREA_FAQS.map((f) => ({ q: f.q.replace("this area", area.name), a: f.a }))} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-5">
            <p className="font-semibold text-brand-900">Booking a visit is easy</p>
            <ol className="mt-2 space-y-1.5 text-sm text-brand-800/90">
              <li>1. Submit the form with photos</li>
              <li>2. We confirm your slot quickly</li>
              <li>3. Inspection → clear quote → fix</li>
            </ol>
            <div className="mt-4 flex flex-col gap-2.5">
              <RequestServiceButton size="md" className="w-full justify-center" label="Book a Visit" />
              <WhatsAppButton size="md" className="w-full justify-center" message={waMessage} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-slate-900">Nearby areas we cover</p>
            <ul className="mt-3 space-y-1.5 text-sm" role="list">
              <li className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden /> All of South Chennai
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden /> Full OMR corridor
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              <Link href="/areas" className="font-medium text-brand-600 hover:text-brand-700">
                View all {""}
                service areas →
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
