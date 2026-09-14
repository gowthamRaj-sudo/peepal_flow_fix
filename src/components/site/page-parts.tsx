import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-card">
      {faqs.map((faq) => (
        <details key={faq.q} className="group px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
            {faq.q}
            <ChevronDown
              className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="container-page pt-6 lg:hidden">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-brand-700">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-slate-700">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page py-10 sm:py-14">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">{eyebrow}</p>
        )}
        <h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{subtitle}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
