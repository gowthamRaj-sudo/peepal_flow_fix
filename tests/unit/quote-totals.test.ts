import { describe, expect, it } from "vitest";
import { computeQuoteTotals } from "@/domain/quote-totals";
import type { QuoteLineInput } from "@/domain/quote-totals";

function line(overrides: Partial<QuoteLineInput> = {}): QuoteLineInput {
  return { kind: "MATERIALS", description: "Item", quantity: 1, unitPrice: 1000, ...overrides };
}

describe("computeQuoteTotals", () => {
  it("sums line amounts and rounds to paise precision", () => {
    const t = computeQuoteTotals({
      lines: [
        line({ unitPrice: 1500.5 }),
        line({ kind: "LABOUR", description: "Labour", quantity: 2, unitPrice: 400 }),
      ],
    });
    expect(t.subtotal).toBeCloseTo(2300.5);
    expect(t.discount).toBe(0);
    expect(t.taxAmount).toBe(0);
    expect(t.total).toBeCloseTo(2300.5);
  });

  it("caps discount at subtotal and applies tax on the discounted base", () => {
    const t = computeQuoteTotals({
      lines: [line({ unitPrice: 10000 })],
      discount: 500,
      taxPercent: 18,
    });
    expect(t.discount).toBe(500);
    expect(t.taxableBase).toBeCloseTo(9500);
    // (10000 - 500) * 18% = 1710
    expect(t.taxAmount).toBeCloseTo(1710);
    expect(t.total).toBeCloseTo(11210);
  });

  it("never lets a discount exceed the subtotal", () => {
    const t = computeQuoteTotals({ lines: [line({ unitPrice: 300 })], discount: 9999 });
    expect(t.discount).toBe(300);
    expect(t.total).toBe(0);
  });

  it("rejects empty line lists", () => {
    expect(() => computeQuoteTotals({ lines: [] })).toThrow();
  });

  it("rejects non-positive quantity and negative price/discount/tax", () => {
    expect(() => computeQuoteTotals({ lines: [line({ quantity: 0 })] })).toThrow();
    expect(() => computeQuoteTotals({ lines: [line({ unitPrice: -1 })] })).toThrow();
    expect(() => computeQuoteTotals({ lines: [line()], discount: -1 })).toThrow();
    expect(() => computeQuoteTotals({ lines: [line()], taxPercent: -5 })).toThrow();
  });
});
