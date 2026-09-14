import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServiceContent } from "@/config/services.data";
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

export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

async function getAreaWithService(areaSlug: string, serviceSlug: string) {
  try {
    return await prisma.serviceArea.findFirst({
      where: { slug: areaSlug, isActive: true },
      include: {
        services: {
          where: { service: { slug: serviceSlug, isActive: true } },
          select: { serviceId: true },
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
  params: Promise<{ slug: string; service: string }>;
}): Promise<Metadata> {
  const { slug, service } = await params;
  const [area, content] = await Promise.all([
    getAreaWithService(slug, service),
    Promise.resolve(getServiceContent(service)),
  ]);
  if (!area || !content) return {};
  const title = `${content.shortName} Services in ${area.name}, Chennai`;
  return {
    title,
    description: `${content.name} in ${area.name} by ${BUSINESS.name}. Experienced local team, written quotations, leak-tested work. Request a site visit online or call now.`,
    alternates: { canonical: `/areas/${slug}/${service}` },
  };
}

export default async function AreaServicePage({
  params,
}: {
  params: Promise<{ slug: string; service: string }>;
}) {
  const { slug, service: serviceSlug } = await params;
  const [area, content] = await Promise.all([
    getAreaWithService(slug, serviceSlug),
    Promise.resolve(getServiceContent(serviceSlug)),
  ]);
  if (!area || !content || area.services.length === 0) notFound();

  const waMessage = `Hi ${BUSINESS.name}, I need ${content.name.toLowerCase()} in ${area.name}.`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${content.name} in ${area.name}`,
      provider: { "@id": `${SITE_URL}/#business` },
      areaServed: { "@type": "Place", name: `${area.name}, Chennai` },
      url: `${SITE_URL}/areas/${slug}/${serviceSlug}`,
    },
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: "Service Areas", url: `${SITE_URL}/areas` },
      { name: area.name, url: `${SITE_URL}/areas/${slug}` },
      { name: content.name, url: `${SITE_URL}/areas/${slug}/${serviceSlug}` },
    ]),
  ];

  const combinedFaqs = [
    ...content.faqs.slice(0, 2),
    {
      q: `Do you serve all parts of ${area.name}?`,
      a: `Yes — we cover ${area.name} and surrounding localities. Book early for morning slots; same-day visits are often possible.`,
    },
  ];

  return (
    <>
      <JsonLd data={[...schema, faqJsonLd(combinedFaqs)]} />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Service Areas", href: "/areas" },
          { name: area.name, href: `/areas/${slug}` },
          { name: content.name },
        ]}
      />

      <PageHero
        eyebrow={`${content.shortName} · ${area.name}`}
        title={`${content.name} in ${area.name}`}
        subtitle={area.context ?? undefined}
      >
        <div className="flex flex-wrap gap-3">
          <RequestServiceButton size="lg" label={`Get a Quote in ${area.name}`} />
          <CallButton size="lg" />
          <WhatsAppButton size="lg" message={waMessage} />
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section aria-labelledby="local-intro">
            <h2 id="local-intro" className="text-xl font-bold text-slate-900">
              Why {area.name} homeowners call us
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">{content.description[0]}</p>
            <p className="mt-3 leading-relaxed text-slate-600">{content.description[1]}</p>
            <p className="mt-3 leading-relaxed text-slate-600">
              Our teams work across {area.name} regularly, so you get technicians familiar with the
              building styles and common installation issues in this part of Chennai.
            </p>
          </section>

          <section aria-labelledby="local-handle">
            <h2 id="local-handle" className="text-xl font-bold text-slate-900">
              What&apos;s included
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2" role="list">
              {content.weHandle.map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white p-3 text-sm text-slate-700 shadow-card">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="local-faq">
            <h2 id="local-faq" className="text-xl font-bold text-slate-900">
              Questions about {content.shortName.toLowerCase()} in {area.name}
            </h2>
            <div className="mt-4">
              <FaqAccordion faqs={combinedFaqs} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-5">
            <p className="font-semibold text-brand-900">Site visit in {area.name}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-800/90">
              Exact pricing depends on what we find on site — that&apos;s why inspection comes
              first and quotation is always written.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <RequestServiceButton size="md" className="w-full justify-center" label="Request Site Visit" />
              <CallButton size="md" className="w-full justify-center" label="Call Now" />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-slate-900">Other services in {area.name}</p>
            <ul className="mt-3 space-y-2 text-sm" role="list">
              <li>
                <a href={`/areas/${slug}`} className="font-medium text-brand-600 hover:text-brand-700">
                  View all services in {area.name} →
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
