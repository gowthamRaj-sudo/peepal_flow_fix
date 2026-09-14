"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { BUSINESS, NAV_LINKS, telLink } from "@/config/business";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-24 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label={`${BUSINESS.name} home`}>
          <span className="flex items-center">
            <Image
              src="/logo-1.png"
              alt={`${BUSINESS.name} logo`}
              width={104}
              height={98}
              className="h-20 w-auto object-contain"
            />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold text-slate-900">Peepal Flow Fix</span>
            <span className="block text-[11px] font-medium tracking-wide text-slate-500">
              SOLUTIONS
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/request-service"
            className="hidden min-h-[40px] items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:inline-flex"
          >
            Request a Service
          </Link>
          <a
            href={telLink()}
            aria-label={`Call ${BUSINESS.name}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-brand-700 hover:bg-brand-50 lg:hidden"
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-page flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="min-h-[48px] border-b border-slate-50 py-3 text-sm font-medium text-slate-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/request-service"
              onClick={() => setOpen(false)}
              className="my-2 rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Request a Service
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
