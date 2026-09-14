import { describe, expect, it } from "vitest";
import { formatInr, formatRange } from "@/lib/money";
import { maskPhone, normalizeIndianPhone } from "@/lib/phone";

describe("formatInr", () => {
  it("formats Indian digit grouping", () => {
    expect(formatInr(125000)).toMatch(/1,25,000/);
  });
  it("falls back to ₹0 for non-finite values", () => {
    expect(formatInr(Number.NaN)).toBe("₹0");
  });
});

describe("formatRange", () => {
  it("returns On inspection when no bounds given", () => {
    expect(formatRange()).toBe("On inspection");
  });
  it("joins bounds with an en dash", () => {
    expect(formatRange(500, 1500)).toContain("–");
  });
});

describe("normalizeIndianPhone", () => {
  it("strips +91 / 0 prefixes and spaces", () => {
    expect(normalizeIndianPhone("+91 98400 12345")).toBe("+919840012345");
    expect(normalizeIndianPhone("09840012345")).toBe("+919840012345");
    expect(normalizeIndianPhone("9840012345")).toBe("+919840012345");
  });
  it("rejects malformed numbers", () => {
    expect(normalizeIndianPhone("12345")).toBeNull();
    expect(normalizeIndianPhone("not a phone")).toBeNull();
  });
  it("masks all but the trailing digits", () => {
    expect(maskPhone("+919840012345")).not.toContain("98400");
    expect(maskPhone("+919840012345")).toContain("345");
  });
});
