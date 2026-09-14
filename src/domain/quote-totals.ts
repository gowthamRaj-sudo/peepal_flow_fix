import { QuoteItemKind } from "@prisma/client";
import { Prisma } from "@prisma/client";

export interface QuoteLineInput {
  kind: QuoteItemKind;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

export interface QuoteTotalsInput {
  lines: QuoteLineInput[];
  discount?: number;
  taxPercent?: number;
}

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  taxableBase: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeQuoteTotals(input: QuoteTotalsInput): QuoteTotals {
  if (!input.lines.length) {
    throw new Error("A quotation needs at least one line item");
  }
  for (const line of input.lines) {
    if (!(line.quantity > 0)) throw new Error("Quantity must be greater than zero");
    if (line.unitPrice < 0) throw new Error("Unit price cannot be negative");
  }
  if ((input.discount ?? 0) < 0) throw new Error("Discount cannot be negative");
  if ((input.taxPercent ?? 0) < 0) throw new Error("Tax cannot be negative");

  const subtotal = round2(
    input.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );
  const discount = Math.min(round2(input.discount ?? 0), subtotal);
  const taxableBase = round2(subtotal - discount);
  const taxPercent = round2(input.taxPercent ?? 0);
  const taxAmount = round2((taxableBase * taxPercent) / 100);
  const total = round2(taxableBase + taxAmount);
  return { subtotal, discount, taxableBase, taxPercent, taxAmount, total };
}

export function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}
