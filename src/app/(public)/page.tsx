import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ClipboardCheck, MapPin, ShieldCheck, Star, Wrench } from "lucide-react";
import { BUSINESS, SITE_URL } from "@/config/business";
import { SERVICES_CONTENT } from "@/config/services.data";
import { getActiveAreas } from "@/server/catalog";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/card";
import {
  CallButton,
  CtaRow,
  RequestServiceButton,
  WhatsAppButton,
} from "@/components/site/cta";
import { JsonLd } from "@/components/site/json-ld";
import { TRUST_POINTS } from "@/config/business";

export const metadata: Metadata = {
  title: `${BUSINESS.name} | Plumber & Bathroom Experts in Chennai`,
  description:
    "Reliable plumbing, electrical and bathroom renovation services across Chennai with 25+ years of experience. Request a service online, call or WhatsApp us today.",
  alternates: { canonical: "/" },
};

export const revalidate = 60;

async function latestProjects() {
  try {
    return await prisma.portfolioProject.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        service: { select: { name: true, slug: true } },
        area: { select: { name: true, slug: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [areas, projects] = await Promise.all([getActiveAreas(), latestProjects()]);

  const howItWorks = [
    { step: "1", title: "Tell us the problem", detail: "Call, WhatsApp or fill the quick form. Photos help us prepare." },
    { step: "2", title: "Site inspection", detail: "We visit at your preferred time and diagnose properly." },
    { step: "3", title: "Clear quotation", detail: "Written price for materials and labour before work starts." },
    { step: "4", title: "Done & tested", detail: "Work completed, tested in front of you and the site left clean." },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: SITE_URL,
          name: BUSINESS.name,
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="container-page py-14 text-center sm:py-20">
          <p className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3.5 py-1 text-xs font-semibold text-accent-700 sm:text-sm">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            {BUSINESS.yearsExperience}+ years of hands-on experience
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Reliable Home Services,{" "}
            <span className="text-brand-600">Backed by 25+ Years of Experience</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Professional plumbing, electrical, bathroom fitting and renovation services
            across Chennai.
          </p>
          <div className="mt-7 flex justify-center">
            <CtaRow />
          </div>
          <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["25+", "Years experience"],
              ["8", "Home services"],
              [`${areas.length}+`, "Chennai areas"],
              ["Same-day", "Visits usually"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white p-3 shadow-card ring-1 ring-slate-100">
                <dt className="sr-only">{label}</dt>
                <dd className="text-xl font-bold text-brand-700">{value}</dd>
                <dd className="text-xs font-medium text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-14 sm:py-18" aria-labelledby="services-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title={<span id="services-heading">Home services handled end to end</span>}
            subtitle="From a dripping tap to a complete bathroom rebuild — one accountable team for your home."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {SERVICES_CONTENT.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-md"
                >
                  <Wrench className="h-6 w-6 text-brand-600" aria-hidden />
                  <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-brand-700">
                    {service.name}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
                    {service.tagline}
                  </p>
                  <span className="mt-3 text-sm font-medium text-brand-600 group-hover:text-brand-700">
                    Learn more →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Peepal Flow Fix */}
      <section className="bg-slate-50 py-14 sm:py-18" aria-labelledby="why-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why homeowners choose us"
            title={<span id="why-heading">Trust built over decades, not marketing claims</span>}
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {TRUST_POINTS.map((point) => (
              <li key={point.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <ShieldCheck className="h-6 w-6 text-accent-600" aria-hidden />
                <h3 className="mt-3 text-base font-semibold text-slate-900">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{point.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="py-14 sm:py-18" aria-labelledby="process-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title={<span id="process-heading">Simple process, no surprises</span>}
          />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {howItWorks.map((item) => (
              <li key={item.step} className="relative rounded-xl bg-white p-5 shadow-card ring-1 ring-slate-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="bg-slate-50 py-14" aria-labelledby="projects-heading">
          <div className="container-page">
            <SectionHeading
              eyebrow="Our work"
              title={<span id="projects-heading">Recent projects around Chennai</span>}
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-3" role="list">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:border-brand-300"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-600">
                      {project.area?.name ?? "Chennai"}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-900">{project.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">{project.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center">
              <Link href="/projects" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                View all projects →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Areas */}
      <section className="py-14 sm:py-18" aria-labelledby="areas-heading">
        <div className="container-page text-center">
          <SectionHeading
            eyebrow="Where we work"
            title={<span id="areas-heading">Serving Chennai &amp; the OMR corridor</span>}
            subtitle="We cover South Chennai and surrounding neighbourhoods with focused, reliable coverage."
          />
          <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2" role="list">
            {areas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:border-brand-400 hover:text-brand-700"
                >
                  <MapPin className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                  {area.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link href="/areas" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              See all service areas →
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-950 py-14 text-white sm:py-16">
        <div className="container-page text-center">
          <Star className="mx-auto h-8 w-8 text-amber-400" aria-hidden />
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Ready to fix it properly this time?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Tell us what needs attention. We&apos;ll respond quickly — usually the same day.
          </p>
          <div className="mt-6 flex justify-center">
            <RequestServiceButton size="xl" label="Request a Service" />
          </div>
          <p className="mt-4 text-sm text-brand-200">
            Or call us directly — we&apos;re happy to just talk through the problem first.
          </p>
        </div>
      </section>
    </>
  );
}
