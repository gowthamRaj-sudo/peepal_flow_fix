import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs, PageHero } from "@/components/site/page-parts";
import { CallButton, RequestServiceButton, WhatsAppButton } from "@/components/site/cta";
import { getPublicContact } from "@/server/settings";
import { BUSINESS } from "@/config/business";

export const metadata: Metadata = {
  title: "Contact Peepal Flow Fix Solutions",
  description:
    "Call, WhatsApp or request a service online. Fast response for plumbing, electrical and bathroom work across Chennai.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const contact = await getPublicContact();

  return (
    <>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
      <PageHero
        eyebrow="Contact"
        title="Talk to a real person about your home problem"
        subtitle="No call centres. You reach the team that will actually do the work."
      />

      <div className="container-page grid gap-8 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:border-brand-300"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Phone className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Call us</p>
              <p className="text-sm text-slate-500">{contact.phone}</p>
            </div>
          </a>

          <a
            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:border-emerald-300"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <MessageCircle className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-slate-900">WhatsApp</p>
              <p className="text-sm text-slate-500">Send photos &amp; get quick answers</p>
            </div>
          </a>

          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:border-brand-300"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Mail className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Email</p>
              <p className="text-sm text-slate-500">{contact.email}</p>
            </div>
          </a>

          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
              <Clock className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Working hours</p>
              <p className="text-sm text-slate-500">Monday – Sunday · 8:00 AM – 8:00 PM</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-100 bg-gradient-to-b from-brand-50 to-white p-6">
          <h2 className="text-lg font-bold text-slate-900">The fastest way to get help</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Submit a service request with photos of the problem. It gives our team everything
            needed to diagnose quickly and arrive prepared — most customers hear back within
            working hours the same day.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600" role="list">
            <li>✓ Takes under two minutes on mobile</li>
            <li>✓ Upload up to 8 photos or videos</li>
            <li>✓ Pick your preferred visit time</li>
            <li>✓ Get a written quotation before any work</li>
          </ul>
          <div className="mt-5 flex flex-col gap-2.5">
            <RequestServiceButton size="lg" className="w-full justify-center" label="Request a Service" />
            <CallButton size="lg" className="w-full justify-center" label={`Or call ${BUSINESS.phone}`} />
          </div>
          <p className="mt-4 text-xs text-slate-400">
            We are a service-area business covering Chennai &amp; OMR — visits are at your home,
            not an office.
          </p>
        </div>
      </div>
    </>
  );
}
