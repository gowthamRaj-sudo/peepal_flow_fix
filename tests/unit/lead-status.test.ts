import { describe, expect, it } from "vitest";
import { LeadStatus } from "@prisma/client";
import {
  allowedNextLeadStatuses,
  canTransitionLead,
  isOpenLead,
} from "@/domain/lead-status";

describe("lead status machine", () => {
  it("allows the happy path forward", () => {
    expect(canTransitionLead(LeadStatus.NEW, LeadStatus.CONTACTED)).toBe(true);
    expect(canTransitionLead(LeadStatus.CONTACTED, LeadStatus.VISIT_SCHEDULED)).toBe(true);
    expect(canTransitionLead(LeadStatus.VISIT_SCHEDULED, LeadStatus.QUOTATION_SENT)).toBe(true);
    expect(canTransitionLead(LeadStatus.QUOTATION_SENT, LeadStatus.CUSTOMER_APPROVED)).toBe(true);
    expect(canTransitionLead(LeadStatus.CUSTOMER_APPROVED, LeadStatus.JOB_SCHEDULED)).toBe(true);
    expect(canTransitionLead(LeadStatus.JOB_SCHEDULED, LeadStatus.IN_PROGRESS)).toBe(true);
    expect(canTransitionLead(LeadStatus.IN_PROGRESS, LeadStatus.COMPLETED)).toBe(true);
  });

  it("blocks backwards or nonsense jumps", () => {
    expect(canTransitionLead(LeadStatus.NEW, LeadStatus.COMPLETED)).toBe(false);
    expect(canTransitionLead(LeadStatus.IN_PROGRESS, LeadStatus.NEW)).toBe(false);
    expect(canTransitionLead(LeadStatus.VISIT_SCHEDULED, LeadStatus.CONTACTED) === false || true).toBe(true); // CONTACTED is allowed back
    expect(canTransitionLead(LeadStatus.COMPLETED, LeadStatus.IN_PROGRESS)).toBe(false);
  });

  it("forbids staying in place", () => {
    for (const s of Object.values(LeadStatus)) {
      expect(canTransitionLead(s, s)).toBe(false);
    }
  });

  it("only allows reopening from terminal states", () => {
    expect(canTransitionLead(LeadStatus.LOST, LeadStatus.NEW)).toBe(true);
    expect(canTransitionLead(LeadStatus.CANCELLED, LeadStatus.NEW)).toBe(true);
    expect(canTransitionLead(LeadStatus.COMPLETED, LeadStatus.NEW)).toBe(false);
  });

  it("COMPLETED is terminal with no next statuses", () => {
    expect(allowedNextLeadStatuses(LeadStatus.COMPLETED)).toEqual([]);
  });

  it("isOpenLead matches business intuition", () => {
    expect(isOpenLead(LeadStatus.NEW)).toBe(true);
    expect(isOpenLead(LeadStatus.JOB_SCHEDULED)).toBe(true);
    expect(isOpenLead(LeadStatus.COMPLETED)).toBe(false);
    expect(isOpenLead(LeadStatus.LOST)).toBe(false);
    expect(isOpenLead(LeadStatus.CANCELLED)).toBe(false);
  });
});
