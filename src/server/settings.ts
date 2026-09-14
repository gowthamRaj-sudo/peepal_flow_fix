import { prisma } from "@/lib/prisma";

export interface BusinessSettings {
  phone: string;
  whatsapp: string;
  email: string;
  workingHours: string;
  googleReviewUrl: string;
  reviewRequestDelayDays: number;
}

const DEFAULTS = {
  business_phone: "",
  business_whatsapp: "",
  business_email: "",
  working_hours: "Mon – Sun · 8:00 AM – 8:00 PM",
  google_review_url: "",
  review_request_delay_days: String(process.env.REVIEW_REQUEST_DELAY_DAYS ?? "2"),
} as const;

export async function getSettings(): Promise<BusinessSettings> {
  const rows = await prisma.setting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    phone: map.get("business_phone") || DEFAULTS.business_phone,
    whatsapp: map.get("business_whatsapp") || DEFAULTS.business_whatsapp,
    email: map.get("business_email") || DEFAULTS.business_email,
    workingHours: map.get("working_hours") || DEFAULTS.working_hours,
    googleReviewUrl: map.get("google_review_url") || DEFAULTS.google_review_url,
    reviewRequestDelayDays: Number(
      map.get("review_request_delay_days") ?? DEFAULTS.review_request_delay_days,
    ),
  };
}

export async function getPublicContact() {
  const settings = await getSettings().catch(() => null);
  const fallback = {
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "",
    whatsapp: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? "",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "",
  };
  if (!settings) return fallback;
  return {
    phone: settings.phone || fallback.phone,
    whatsapp: settings.whatsapp || fallback.whatsapp,
    email: settings.email || fallback.email,
  };
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
