import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(16),
  NEXT_PUBLIC_BUSINESS_NAME: z.string().default("Peepal Flow Fix Solutions"),
  NEXT_PUBLIC_BUSINESS_PHONE: z.string().default("+919800000000"),
  NEXT_PUBLIC_BUSINESS_WHATSAPP: z.string().default("+919800000000"),
  NEXT_PUBLIC_BUSINESS_EMAIL: z.string().default("hello@peepalflowfix.in"),
  GOOGLE_REVIEW_URL: z.string().optional().or(z.literal("")),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("./.data/uploads"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  WHATSAPP_API_URL: z.string().optional().or(z.literal("")),
  WHATSAPP_API_TOKEN: z.string().optional().or(z.literal("")),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().or(z.literal("")),
  SMS_API_KEY: z.string().optional().or(z.literal("")),
  EMAIL_API_KEY: z.string().optional().or(z.literal("")),
  ADMIN_ALERT_EMAIL: z.string().optional().or(z.literal("")),
  ADMIN_ALERT_SMS: z.string().optional().or(z.literal("")),
  OWNER_ALERT_PHONE: z.string().optional().or(z.literal("")),
  CRON_SECRET: z.string().optional(),
  REVIEW_REQUEST_DELAY_DAYS: z.coerce.number().int().min(0).default(2),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration -> ${issues}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
