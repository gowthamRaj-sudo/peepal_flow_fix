import { z } from "zod";
import { normalizeIndianPhone } from "@/lib/phone";

const phoneSchema = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => normalizeIndianPhone(v) !== null, "Enter a valid 10-digit mobile number")
  .transform((v) => normalizeIndianPhone(v) as string);

export const preferredTimeValues = ["MORNING", "AFTERNOON", "EVENING", "FLEXIBLE"] as const;
export const leadSourceValues = [
  "GOOGLE_BUSINESS",
  "ORGANIC_SEARCH",
  "WEBSITE",
  "WHATSAPP",
  "PHONE",
  "INSTAGRAM",
  "FACEBOOK",
  "REFERRAL",
  "DIRECT",
  "OTHER",
] as const;

export const leadCreateSchema = z.object({
  serviceSlug: z.string().min(1, "Select a service").max(64),
  areaSlug: z.string().max(64).optional().nullable(),
  customerName: z.string().trim().min(2, "Please enter your name").max(80),
  phone: phoneSchema,
  whatsapp: z.string().optional().transform((v) => (v && v.trim() ? v : undefined))
    .pipe(phoneSchema.optional()),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  description: z.string().trim().min(10, "Tell us briefly what you need (10+ characters)").max(2000),
  address: z.string().trim().min(5, "Enter your locality/address").max(500),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  preferredTime: z.enum(preferredTimeValues),
  uploadIds: z.array(z.string()).max(8).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required so we can contact you" }) }),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  landingPage: z.string().max(300).optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

export const loginSchema = z.object({
  phone: z.string().min(4),
  password: z.string().min(1),
});

export const leadUpdateSchema = z.object({
  status: z.custom<string>((v) => typeof v === "string").optional(),
  assignedToId: z.string().nullable().optional(),
  visitAt: z.string().datetime({ offset: true }).nullable().optional(),
  internalNotes: z.string().max(4000).optional(),
}).refine((data) => Object.keys(data).length > 0, "Nothing to update");

export const leadNoteSchema = z.object({
  body: z.string().trim().min(1, "Note cannot be empty").max(2000),
});

export const customerUpsertSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  whatsapp: phoneSchema.optional().or(z.literal("")).transform((v) => v || undefined),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().trim().max(500).optional(),
  areaId: z.string().optional().nullable(),
  pincode: z.string().regex(/^\d{6}$/).optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export const jobUpdateFieldWorkerSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().max(3000).optional(),
});

export const jobScheduleSchema = z.object({
  leadId: z.string(),
  scheduledFor: z.string().datetime({ offset: true }),
  assignedToId: z.string().optional().nullable(),
  address: z.string().trim().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const quoteItemInputSchema = z.object({
  kind: z.enum(["MATERIALS", "LABOUR", "OTHER"]),
  description: z.string().trim().min(1).max(300),
  quantity: z.coerce.number().positive(),
  unit: z.string().trim().max(16).default("nos"),
  unitPrice: z.coerce.number().nonnegative(),
});

export const quoteCreateSchema = z.object({
  customerId: z.string(),
  leadId: z.string().optional(),
  jobId: z.string().optional(),
  serviceId: z.string().optional(),
  workDescription: z.string().trim().max(3000).optional(),
  materialsNote: z.string().trim().max(1000).optional(),
  discount: z.coerce.number().nonnegative().default(0),
  taxPercent: z.coerce.number().min(0).max(50).default(0),
  notes: z.string().max(1000).optional(),
  paymentTerms: z.string().max(500).optional(),
  validUntilDays: z.coerce.number().int().min(1).max(180).default(15),
  items: z.array(quoteItemInputSchema).min(1, "Add at least one line item"),
});
