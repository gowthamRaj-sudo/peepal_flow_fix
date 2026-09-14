export const BUSINESS = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Peepal Flow Fix Solutions",
  tagline: "Reliable Home Services, Backed by 25+ Years of Experience",
  supportLine:
    "Professional plumbing, electrical, bathroom fitting and renovation services across Chennai.",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "+919800000000",
  whatsapp: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? "+919800000000",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "hello@peepalflowfix.in",
  city: "Chennai",
  region: "Tamil Nadu",
  country: "IN",
  postalCode: "600130",
  addressLocalityNote: "Service-area business serving Chennai & OMR corridor",
  yearsExperience: 25,
  openingHours: "Mo-Su 08:00-20:00",
  priceRange: "₹₹",
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function whatsappLink(message?: string): string {
  const number = BUSINESS.whatsapp.replace(/\D/g, "");
  const text = encodeURIComponent(
    message ?? `Hi ${BUSINESS.name}, I need help with a home service.`,
  );
  return `https://wa.me/${number}?text=${text}`;
}

export function telLink(): string {
  return `tel:${BUSINESS.phone.replace(/[^\d+]/g, "")}`;
}

export const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/areas", label: "Service Areas" },
  { href: "/projects", label: "Our Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const TRUST_POINTS = [
  {
    title: "25+ Years of Experience",
    detail: "Practical experience built through more than two decades of hands-on work in Chennai homes.",
  },
  {
    title: "Clear Written Quotes",
    detail: "Know the full cost before work begins — materials and labour, item by item.",
  },
  {
    title: "One Accountable Team",
    detail: "The person who inspects your job is the person responsible for finishing it well.",
  },
  {
    title: "Workmanship Guarantee",
    detail: "If a problem traces back to our installation, we return and set it right.",
  },
] as const;
