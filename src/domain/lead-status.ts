import { LeadStatus } from "@prisma/client";

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "VISIT_SCHEDULED",
  "QUOTATION_SENT",
  "CUSTOMER_APPROVED",
  "JOB_SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
];

export const LEAD_TERMINAL_STATUSES: LeadStatus[] = ["CANCELLED", "LOST"];

const TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: [
    "CONTACTED",
    "VISIT_SCHEDULED",
    "QUOTATION_SENT",
    "JOB_SCHEDULED",
    "CANCELLED",
    "LOST",
  ],
  CONTACTED: [
    "VISIT_SCHEDULED",
    "QUOTATION_SENT",
    "JOB_SCHEDULED",
    "CANCELLED",
    "LOST",
  ],
  VISIT_SCHEDULED: [
    "QUOTATION_SENT",
    "JOB_SCHEDULED",
    "CONTACTED",
    "CANCELLED",
    "LOST",
  ],
  QUOTATION_SENT: ["CUSTOMER_APPROVED", "JOB_SCHEDULED", "CONTACTED", "LOST"],
  CUSTOMER_APPROVED: ["JOB_SCHEDULED", "QUOTATION_SENT", "LOST"],
  JOB_SCHEDULED: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["NEW"],
  LOST: ["NEW"],
};

export function canTransitionLead(
  from: LeadStatus,
  to: LeadStatus,
): boolean {
  if (from === to) return false;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function allowedNextLeadStatuses(from: LeadStatus): LeadStatus[] {
  return TRANSITIONS[from] ?? [];
}

export function isOpenLead(status: LeadStatus): boolean {
  return !LEAD_TERMINAL_STATUSES.includes(status) && status !== "COMPLETED";
}
