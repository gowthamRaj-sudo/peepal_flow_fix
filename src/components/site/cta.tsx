"use client";

import Link from "next/link";
import { Phone, MessageCircle, ArrowRight, ClipboardList } from "lucide-react";
import { BUSINESS, telLink, whatsappLink } from "@/config/business";

export function trackCta(name: string) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ name, path: location.pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/events", { method: "POST", body: payload, keepalive: true });
    }
  } catch {
    // analytics must never break UX
  }
}

export function CallButton({
  size = "lg",
  label = "Call Now",
  className,
}: {
  size?: "md" | "lg" | "xl";
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={telLink()}
      onClick={() => trackCta("click_to_call")}
      data-analytics="click_to_call"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white font-semibold text-brand-700 hover:bg-brand-50 ${
        size === "xl" ? "px-7 py-3.5 min-h-[56px]" : size === "lg" ? "px-6 py-3 min-h-[48px]" : "px-4 py-2.5 min-h-[44px]"
      } ${className ?? ""}`}
    >
      <Phone className="h-5 w-5" aria-hidden />
      {label}
    </a>
  );
}

export function WhatsAppButton({
  size = "lg",
  label = "WhatsApp Us",
  message,
  className,
}: {
  size?: "md" | "lg" | "xl";
  label?: string;
  message?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCta("whatsapp_click")}
      data-analytics="whatsapp_click"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700 ${
        size === "xl" ? "px-7 py-3.5 min-h-[56px]" : size === "lg" ? "px-6 py-3 min-h-[48px]" : "px-4 py-2.5 min-h-[44px]"
      } ${className ?? ""}`}
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      {label}
    </a>
  );
}

export function RequestServiceButton({
  size = "lg",
  label = "Request a Service",
  href = "/request-service",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  href?: string;
  className?: string;
}) {
  const sizes = {
    sm: "text-sm px-3 py-1.5 min-h-[36px]",
    md: "text-sm px-4 py-2.5 min-h-[44px]",
    lg: "text-base px-6 py-3 min-h-[48px]",
    xl: "text-base px-7 py-3.5 min-h-[56px]",
  } as const;
  return (
    <Link
      href={href}
      onClick={() => trackCta("request_service_click")}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 font-semibold text-white hover:bg-brand-700 ${sizes[size]} ${className ?? ""}`}
    >
      <ClipboardList className="h-5 w-5" aria-hidden />
      {label}
    </Link>
  );
}

export function CtaRow({ center = true }: { center?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
      <RequestServiceButton size="xl" />
      <CallButton size="xl" />
      <WhatsAppButton size="xl" />
    </div>
  );
}

export function StickyMobileCta() {
  return (
    <nav
      aria-label="Quick contact"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 divide-x divide-white/20 border-t border-slate-200 bg-white shadow-[0_-4px_16px_rgba(15,23,42,0.08)] md:hidden"
    >
      <a
        href={telLink()}
        onClick={() => trackCta("sticky_call")}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-semibold text-brand-700 active:bg-brand-50"
      >
        <Phone className="h-5 w-5" aria-hidden /> Call Now
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackCta("sticky_whatsapp")}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-semibold text-emerald-700 active:bg-emerald-50"
      >
        <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
      </a>
      <Link
        href="/request-service"
        onClick={() => trackCta("sticky_request")}
        className="flex flex-col items-center justify-center gap-0.5 bg-brand-600 py-2.5 text-xs font-semibold text-white active:bg-brand-700"
      >
        <ArrowRight className="h-5 w-5" aria-hidden /> Request Service
      </Link>
    </nav>
  );
}
