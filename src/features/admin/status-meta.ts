import type { LeadStatus, JobStatus, QuoteStatus } from "@prisma/client";

export const LEAD_STATUS_META: Record<LeadStatus, { label: string; tone: string }> = {
  NEW: { label: "New", tone: "blue" },
  CONTACTED: { label: "Contacted", tone: "violet" },
  VISIT_SCHEDULED: { label: "Visit scheduled", tone: "amber" },
  QUOTATION_SENT: { label: "Quote sent", tone: "amber" },
  CUSTOMER_APPROVED: { label: "Approved", tone: "green" },
  JOB_SCHEDULED: { label: "Job scheduled", tone: "blue" },
  IN_PROGRESS: { label: "In progress", tone: "violet" },
  COMPLETED: { label: "Completed", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  LOST: { label: "Lost", tone: "red" },
};

export const JOB_STATUS_META: Record<JobStatus, { label: string; tone: string }> = {
  SCHEDULED: { label: "Scheduled", tone: "blue" },
  IN_PROGRESS: { label: "In progress", tone: "violet" },
  COMPLETED: { label: "Completed", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

export const QUOTE_STATUS_META: Record<QuoteStatus, { label: string; tone: string }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  SENT: { label: "Sent", tone: "blue" },
  VIEWED: { label: "Viewed", tone: "violet" },
  ACCEPTED: { label: "Accepted", tone: "green" },
  REJECTED: { label: "Rejected", tone: "red" },
  EXPIRED: { label: "Expired", tone: "amber" },
};

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(d));
}

export function formatDay(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(
    new Date(d),
  );
}
