import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { BUSINESS, NAV_LINKS, telLink, whatsappLink } from "@/config/business";
import { SERVICES_CONTENT } from "@/config/services.data";

export function Footer({ contact }: { contact?: { phone: string; whatsapp: string; email: string } }) {
  const phone = contact?.phone || BUSINESS.phone;
  const email = contact?.email || BUSINESS.email;

  return (
    <footer className="border-t border-slate-200 bg-slate-900 pb-20 text-slate-300 md:pb-0">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Image
            src="/bottom-logo.png"
            alt={`${BUSINESS.name} logo`}
            width={80}
            height={90}
            className="h-auto w-20 object-contain"
          />
          <p className="mt-2 text-lg font-bold text-white">Peepal Flow Fix Solutions</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            {BUSINESS.supportLine}
          </p>
          <p className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-accent-300">
            {BUSINESS.yearsExperience}+ years of hands-on experience
          </p>
        </div>

        <nav aria-label="Services footer">
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Services</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SERVICES_CONTENT.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="font-medium text-brand-300 hover:text-white">
                View all services
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Company footer">
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white">Contact</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a href={telLink()} className="inline-flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4" aria-hidden /> {phone}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp us
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4" aria-hidden /> {email}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Service-area business · {BUSINESS.addressLocalityNote} · Mon–Sun, 8 AM – 8 PM
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-slate-400 sm:flex-row">
          <p className="flex items-center gap-2.5">
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p>Serving Chennai &amp; the OMR corridor</p>
        </div>
      </div>
    </footer>
  );
}
