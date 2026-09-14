import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatInr } from "@/lib/money";
import { BUSINESS } from "@/config/business";

export interface QuotePdfLine {
  kind: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface QuotePdfData {
  code: string;
  customerName: string;
  customerPhone: string;
  address?: string | null;
  serviceName?: string | null;
  workDescription?: string | null;
  materialsNote?: string | null;
  lines: QuotePdfLine[];
  subtotal: number;
  discount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
  paymentTerms?: string | null;
  validUntil?: Date | null;
  createdAt: Date;
}

export async function generateQuotePdf(data: QuotePdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Quotation ${data.code}`);
  doc.setAuthor(BUSINESS.name);

  let page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const width = 595.28 - margin * 2;
  const brand = rgb(0.11, 0.46, 0.92);
  const dark = rgb(0.09, 0.13, 0.22);
  const gray = rgb(0.42, 0.47, 0.55);
  let y = 800;

  // Standard fonts use WinAnsi encoding: map ₹ and drop anything it can't render.
  const asciiSafe = (s: string): string => s.replace(/₹/g, "Rs. ").replace(/[^\u0000-\u00ff]/g, "");

  const text = (
    raw: string,
    x: number,
    yy: number,
    size = 10,
    f = font,
    color = dark,
  ) => {
    const s = asciiSafe(raw);
    if (!s) return;
    page.drawText(s, { x, y: yy, size, font: f, color });
  };

  const textWidth = (raw: string, size: number, f = font): number =>
    f.widthOfTextAtSize(asciiSafe(raw), size);

  const ensureSpace = (needed: number) => {
    if (y - needed < 60) {
      page = doc.addPage([595.28, 841.89]);
      y = 790;
    }
  };

  // Header band
  page.drawRectangle({ x: 0, y: 762, width: 595.28, height: 80, color: brand });
  text(BUSINESS.name, margin, 806, 18, bold, rgb(1, 1, 1));
  text("Home Solutions — Plumbing · Electrical · Bathrooms", margin, 789, 9, font, rgb(0.85, 0.93, 1));
  text(`Ph ${BUSINESS.phone}`, 595.28 - margin - textWidth(`Ph ${BUSINESS.phone}`, 9, bold), 806, 9, bold, rgb(1, 1, 1));
  text("Chennai · Service Area Business", 595.28 - margin - textWidth("Chennai · Service Area Business", 9), 789, 9, font, rgb(0.85, 0.93, 1));

  y = 730;
  text("QUOTATION", margin, y, 16, bold, dark);
  text(data.code, 595.28 - margin - textWidth(data.code, 12, bold), y, 12, bold, dark);
  y -= 16;
  text(`Date: ${data.createdAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`, margin, y, 9, font, gray);
  if (data.validUntil) {
    text(
      `Valid until: ${data.validUntil.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`,
      400,
      y,
      9,
      font,
      gray,
    );
  }

  // Customer block
  y -= 28;
  text("Quotation for", margin, y, 9, bold, gray);
  y -= 14;
  text(data.customerName, margin, y, 11, bold);
  y -= 13;
  text(data.customerPhone, margin, y, 9, font);
  if (data.address) {
    y -= 13;
    const addrLines = wrapText(asciiSafe(data.address), font, 9, width - 100);
    for (const line of addrLines.slice(0, 3)) {
      text(line, margin, y, 9, font, gray);
      y -= 12;
    }
  }
  if (data.serviceName) {
    y -= 14;
    text(`Service: `, margin, y, 9, bold, gray);
    text(data.serviceName, margin + bold.widthOfTextAtSize("Service: ", 9), y, 9, font, gray);
  }

  // Work description
  if (data.workDescription) {
    y -= 24;
    text("Scope of work", margin, y, 10, bold);
    y -= 14;
    for (const line of wrapText(data.workDescription, font, 9, width)) {
      ensureSpace(14);
      text(line, margin, y, 9, font, dark);
      y -= 12;
    }
  }

  // Items table
  y -= 26;
  page.drawRectangle({ x: margin, y: y - 4, width, height: 20, color: rgb(0.94, 0.96, 0.99) });
  text("#", margin + 6, y + 2, 9, bold, gray);
  text("Description", margin + 26, y + 2, 9, bold, gray);
  text("Qty", 360, y + 2, 9, bold, gray);
  text("Rate", 408, y + 2, 9, bold, gray);
  text("Amount", 480, y + 2, 9, bold, gray);
  y -= 18;

  data.lines.forEach((line, i) => {
    ensureSpace(30);
    const descLines = wrapText(line.description, font, 9, 300);
    descLines.forEach((dl, j) => {
      text(dl, margin + 26, y, 9, font, dark);
      if (j === 0) {
        text(String(i + 1), margin + 6, y, 9);
        text(`${line.quantity} ${line.unit}`.slice(0, 14), 352, y, 9);
        text(formatInr(line.unitPrice), 396, y, 9);
        text(formatInr(line.amount), 470, y, 9);
        text(line.kind, margin + 26, y - 11, 7, font, gray);
      }
      y -= j === 0 ? 26 : 12;
    });
  });

  // Totals
  ensureSpace(110);
  y -= 6;
  const totalX = 380;
  const row = (label: string, value: string, isBold = false, size = 9) => {
    text(label, totalX, y, size, isBold ? bold : font, gray);
    text(value, 595.28 - margin - textWidth(value, size, isBold ? bold : font), y, size, isBold ? bold : font, dark);
    y -= 15;
  };
  row("Subtotal", formatInr(data.subtotal));
  if (data.discount > 0) row("Discount", `- ${formatInr(data.discount)}`);
  if (data.taxPercent > 0) {
    row(`Tax (${data.taxPercent}%)`, formatInr(data.taxAmount));
  }
  y += 2;
  page.drawRectangle({ x: totalX - 8, y: y - 4, width: 595.28 - margin - totalX + 8, height: 22, color: rgb(0.94, 0.96, 0.99) });
  text("TOTAL", totalX, y + 2, 11, bold, dark);
  text(formatInr(data.total), 595.28 - margin - textWidth(formatInr(data.total), 11, bold), y + 2, 11, bold, brand);
  y -= 24;

  if (data.materialsNote) {
    text("Materials note:", margin, y, 9, bold, gray);
    y -= 12;
    for (const line of wrapText(data.materialsNote, font, 9, width)) {
      ensureSpace(14);
      text(line, margin, y, 9, font, dark);
      y -= 12;
    }
    y -= 6;
  }
  if (data.paymentTerms) {
    text("Payment terms:", margin, y, 9, bold, gray);
    y -= 12;
    for (const line of wrapText(data.paymentTerms, font, 9, width)) {
      ensureSpace(14);
      text(line, margin, y, 9, font, dark);
      y -= 12;
    }
    y -= 6;
  }
  if (data.notes) {
    text("Notes:", margin, y, 9, bold, gray);
    y -= 12;
    for (const line of wrapText(data.notes, font, 9, width)) {
      ensureSpace(14);
      text(line, margin, y, 9, font, dark);
      y -= 12;
    }
  }

  // Footer disclaimer
  ensureSpace(70);
  y = Math.min(y, 90);
  page.drawLine({ start: { x: margin, y }, end: { x: 595.28 - margin, y }, thickness: 0.75, color: rgb(0.88, 0.9, 0.94) });
  y -= 14;
  for (const line of [
    "This quotation is valid until the date shown above. Final pricing confirmed at site inspection.",
    "We appreciate the opportunity to work on your home.",
  ]) {
    text(line, margin, y, 8, font, gray);
    y -= 11;
  }

  return doc.save();
}

function wrapText(s: string, font: { widthOfTextAtSize(t: string, size: number): number }, size: number, maxWidth: number): string[] {
  const words = s.replace(/₹/g, "Rs. ").replace(/[^\u0000-\u00ff]/g, "").split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}
