import type { Metadata } from "next";
import { BUSINESS } from "@/config/business";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing services provided by Peepal Flow Fix Solutions.",
  alternates: { canonical: "/terms" },
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Services",
    body: [
      `${BUSINESS.name} provides home maintenance services including plumbing, electrical work, bathroom installation/renovation and related repairs within our declared service areas around Chennai.`,
    ],
  },
  {
    heading: "2. Quotations & pricing",
    body: [
      "Prices communicated before inspection are indicative ranges only. Binding pricing is provided in a written quotation after site inspection. Work proceeds only after your approval of the quotation.",
      "Quotations are valid for the period stated in them (typically 15 days), as material prices may change.",
    ],
  },
  {
    heading: "3. Materials",
    body: [
      "Where we supply materials, genuine branded products are used with manufacturer warranties applying to those products. Where you supply materials, our warranty covers workmanship only.",
    ],
  },
  {
    heading: "4. Workmanship guarantee",
    body: [
      "If an issue arises from our installation or repair workmanship, we will rectify it at no labour cost when reported within 90 days of completion. This covers our work, not pre-existing conditions or product failures.",
    ],
  },
  {
    heading: "5. Access & safety",
    body: [
      "You agree to provide safe access to the work area, water/electricity supply where needed, and to secure pets and valuables. We may decline work we assess as unsafe without proper precautions.",
    ],
  },
  {
    heading: "6. Payments",
    body: [
      "Payment terms are stated in each quotation. For larger projects, stage-wise payments may apply. Invoices are due as per agreed terms; delayed payments may pause scheduled work.",
    ],
  },
  {
    heading: "7. Cancellations",
    body: [
      "Visits can be rescheduled or cancelled free of charge up to 2 hours before the appointment. Cancellation after our team departs for a paid diagnostic visit may incur the visit charge.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    body: [
      "Our liability for any claim is limited to the value of the work performed for you. We are not liable for indirect losses, pre-existing defects, or issues arising from third-party work.",
    ],
  },
];

export default function TermsPage() {
  return (
    <article className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: August 2026 · Applies to {BUSINESS.name}
      </p>
      {SECTIONS.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">{section.heading}</h2>
          {section.body.map((para) => (
            <p key={para.slice(0, 24)} className="mt-3 leading-relaxed text-slate-600">
              {para}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
