import type { Metadata } from "next";
import { BUSINESS } from "@/config/business";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Peepal Flow Fix Solutions collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Information we collect",
    body: [
      "When you submit a service request we collect your name, phone number, optional WhatsApp number and email, your address/pincode, the service you need, a description of the problem, your preferred visit time, and any photos or videos you choose to upload.",
      "We also record basic technical data such as which page referred you to us (for example a Google search) so we can understand how customers find us. We do not use advertising trackers that build profiles of individual visitors.",
    ],
  },
  {
    heading: "2. How we use your information",
    body: [
      "Your information is used strictly to operate our service: responding to your enquiry, scheduling visits, preparing quotations, completing jobs, and following up on completed work.",
      "We may send you service-related messages (appointment confirmations, technician updates, quotation links). Promotional messages are only sent where you have explicitly opted in, and every marketing message includes an opt-out.",
    ],
  },
  {
    heading: "3. Photos and videos you share",
    body: [
      "Photos and videos you upload are used to diagnose and document your job. They are stored securely with access limited to our team members working on your request.",
      "We never publish photos of your property publicly without your explicit permission. Portfolio photos are only published after asking the customer involved.",
    ],
  },
  {
    heading: "4. Who can see your data",
    body: [
      "Only authorised Peepal Flow Fix team members can view customer records. Access is role-based: field technicians see only the jobs assigned to them. We never sell or rent customer information to anyone.",
    ],
  },
  {
    heading: "5. Data retention",
    body: [
      "Enquiry and job records are retained for as long as needed to serve you and meet accounting/legal obligations. You may request deletion of your contact details at any time by contacting us; we will remove what we are not legally required to keep.",
    ],
  },
  {
    heading: "6. Security",
    body: [
      "We protect your data using encrypted connections (HTTPS), access controls, and industry-standard cloud infrastructure. Payment details, where collected, are handled per applicable regulations.",
    ],
  },
  {
    heading: "7. Your rights & contact",
    body: [
      `You may ask us what data we hold about you, request corrections, or request deletion. Reach us at ${BUSINESS.email} or call ${BUSINESS.phone} for any privacy request.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: August 2026 · Applies to {BUSINESS.name}
      </p>
      <p className="mt-6 leading-relaxed text-slate-600">
        Your home, your contact details and your photos deserve careful handling. This policy
        explains — in plain language — exactly what we collect and why.
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
