import type { Metadata } from "next";
import { BadgeCheck, Handshake, MapPin, ShieldCheck, Timer, Users } from "lucide-react";
import { Breadcrumbs, PageHero } from "@/components/site/page-parts";
import { CtaRow } from "@/components/site/cta";
import { TRUST_POINTS } from "@/config/business";

export const metadata: Metadata = {
  title: "About Peepal Flow Fix Solutions",
  description:
    "Meet the experienced team behind Peepal Flow Fix Solutions — 25+ years of hands-on plumbing, electrical and bathroom renovation experience across Chennai homes.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About" }]} />
      <PageHero
        eyebrow="Our story"
        title="Two decades of fixing Chennai homes, one honest job at a time"
        subtitle="Peepal Flow Fix Solutions is led by a master technician with more than 25 years of hands-on experience — supported by his son who built this platform to make service simple for customers."
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="prose prose-slate max-w-none">
            <h2>Experience you can verify on the job</h2>
            <p>
              Our founder started working with tools in the late 1990s — learning plumbing and
              electrical work the hard way, home by home. Over 25+ years he has seen every kind
              of problem a Chennai house can develop: monsoon seepage, hard-water damaged
              fittings, ageing pipelines in older neighbourhoods, wiring that predates modern
              appliance loads.
            </p>
            <p>
              That experience matters to you in a very practical way: correct diagnosis the first
              time, materials chosen for durability (not margin), and work done to standards that
              hold up for years — not just until the van leaves.
            </p>

            <h2>Honest about what we are</h2>
            <p>
              We are a small, focused team — deliberately. The person who inspects your job takes
              responsibility for it. We don&apos;t claim certifications we don&apos;t hold, we
              don&apos;t invent discounts, and we won&apos;t recommend work your home doesn&apos;t
              need. Our reputation in each area we serve is our most valuable asset.
            </p>
            <p>
              What we are building is simple: the most dependable home-service relationship you
              have, backed by modern systems so nothing gets lost — your photos, quotes, visit
              schedules and history stay organised.
            </p>

            <h2>What we believe</h2>
          </section>

          <ul className="grid gap-4 sm:grid-cols-2" role="list">
            {[
              { icon: BadgeCheck, title: "Diagnose before quoting", text: "No phone-in guesses that change at the doorstep." },
              { icon: ShieldCheck, title: "Written quotations", text: "Materials and labour itemised before work starts." },
              { icon: Timer, title: "Respect for your time", text: "Slots we commit to, with a call before arrival." },
              { icon: Handshake, title: "Fix it once", text: "The cheapest repair is the one you don't repeat." },
              { icon: Users, title: "Family-run accountability", text: "A family name on every job we complete." },
              { icon: MapPin, title: "Focused coverage", text: "Deep service in South Chennai & OMR, not thin city-wide claims." },
            ].map((item) => (
              <li key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <item.icon className="h-6 w-6 text-brand-600" aria-hidden />
                <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.text}</p>
              </li>
            ))}
          </ul>

          <section aria-labelledby="trust-points" className="rounded-xl bg-slate-50 p-6">
            <h2 id="trust-points" className="text-lg font-bold text-slate-900">Our promises to you</h2>
            <ul className="mt-4 space-y-3" role="list">
              {TRUST_POINTS.map((point) => (
                <li key={point.title} className="text-sm">
                  <span className="font-semibold text-slate-800">{point.title}. </span>
                  <span className="text-slate-600">{point.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-6 text-center">
            <p className="text-5xl font-extrabold text-brand-700">25+</p>
            <p className="mt-1 font-semibold text-brand-900">years of hands-on experience</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-800/80">
              Practical experience built through more than two decades of real work in real
              homes — not classroom theory.
            </p>
          </div>
        </aside>
      </div>

      <section className="border-t border-slate-100 py-12">
        <div className="container-page flex justify-center">
          <CtaRow />
        </div>
      </section>
    </>
  );
}
