import { Prisma, QuoteStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/errors";
import { nextCode } from "@/lib/codes";
import { computeQuoteTotals, toDecimal } from "@/domain/quote-totals";
import type { QuoteLineInput } from "@/domain/quote-totals";
import { generateQuotePdf } from "@/services/pdf/quote-pdf";
import { newStorageKey, storage } from "@/services/storage";
import { notificationService } from "@/services/notifications";
import { getActiveTemplate, renderTemplate } from "@/services/templates";
import { env } from "@/lib/env";

export interface CreateQuoteInput {
  customerId: string;
  leadId?: string;
  jobId?: string;
  serviceId?: string;
  workDescription?: string;
  materialsNote?: string;
  discount: number;
  taxPercent: number;
  notes?: string;
  paymentTerms?: string;
  validUntilDays: number;
  items: QuoteLineInput[];
}

export const quotesService = {
  async create(input: CreateQuoteInput) {
    const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw badRequest("Customer not found");

    let serviceId = input.serviceId ?? null;
    if (!serviceId && input.jobId) {
      const job = await prisma.job.findUnique({ where: { id: input.jobId }, select: { serviceId: true } });
      serviceId = job?.serviceId ?? null;
    }
    if (!serviceId && input.leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: input.leadId }, select: { serviceId: true } });
      serviceId = lead?.serviceId ?? null;
    }

    const totals = computeQuoteTotals({
      lines: input.items,
      discount: input.discount,
      taxPercent: input.taxPercent,
    });

    const code = await nextCode("quote");
    const publicToken = crypto.randomUUID().replace(/-/g, "");

    return prisma.quote.create({
      data: {
        code,
        publicToken,
        customerId: input.customerId,
        leadId: input.leadId ?? null,
        jobId: input.jobId ?? null,
        serviceId,
        workDescription: input.workDescription ?? null,
        materialsNote: input.materialsNote ?? null,
        subtotal: toDecimal(totals.subtotal),
        discount: toDecimal(totals.discount),
        taxPercent: toDecimal(totals.taxPercent),
        taxAmount: toDecimal(totals.taxAmount),
        total: toDecimal(totals.total),
        notes: input.notes ?? null,
        paymentTerms:
          input.paymentTerms ??
          "50% advance on approval, balance on completion. UPI / bank transfer accepted.",
        validUntil: new Date(Date.now() + input.validUntilDays * 86400_000),
        items: {
          create: input.items.map((item, i) => ({
            kind: item.kind,
            description: item.description,
            quantity: toDecimal(item.quantity),
            unit: item.unit ?? "nos",
            unitPrice: toDecimal(item.unitPrice),
            amount: toDecimal(item.quantity * item.unitPrice),
            sortOrder: i,
          })),
        },
      },
      include: { items: true, customer: true, service: true },
    });
  },

  async getByToken(token: string) {
    const quote = await prisma.quote.findUnique({
      where: { publicToken: token },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        customer: { select: { name: true, phone: true, address: true, pincode: true } },
        service: { select: { name: true } },
      },
    });
    if (!quote) throw notFound("This quotation link is invalid or has been removed");

    if (quote.status === "SENT") {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: "VIEWED", viewedAt: quote.viewedAt ?? new Date() },
      });
    }
    if (quote.validUntil && quote.validUntil < new Date() && ["SENT", "VIEWED"].includes(quote.status)) {
      await prisma.quote.update({ where: { id: quote.id }, data: { status: "EXPIRED" } });
      return { ...quote, status: "EXPIRED" as QuoteStatus };
    }
    return quote;
  },

  async respond(token: string, action: "ACCEPT" | "REJECT") {
    const quote = await prisma.quote.findUnique({ where: { publicToken: token }, select: { id: true, status: true } });
    if (!quote) throw notFound("Quotation not found");
    if (!["SENT", "VIEWED", "EXPIRED"].includes(quote.status)) {
      throw badRequest(`This quotation cannot be ${action.toLowerCase()}ed in its current state`);
    }
    return prisma.quote.update({
      where: { id: quote.id },
      data:
        action === "ACCEPT"
          ? { status: "ACCEPTED", acceptedAt: new Date() }
          : { status: "REJECTED", rejectedAt: new Date() },
    });
  },

  async send(quoteId: string): Promise<void> {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: true,
        customer: true,
        service: true,
      },
    });
    if (!quote) throw notFound("Quote not found");

    // Generate and store PDF if not yet present.
    let pdfKey = quote.pdfKey;
    if (!pdfKey) {
      const pdfBytes = await generateQuotePdf({
        code: quote.code,
        customerName: quote.customer.name,
        customerPhone: quote.customer.phone,
        address: quote.customer.address,
        serviceName: quote.service?.name ?? null,
        workDescription: quote.workDescription,
        materialsNote: quote.materialsNote,
        lines: quote.items.map((i) => ({
          kind: i.kind,
          description: i.description,
          quantity: Number(i.quantity),
          unit: i.unit,
          unitPrice: Number(i.unitPrice),
          amount: Number(i.amount),
        })),
        subtotal: Number(quote.subtotal),
        discount: Number(quote.discount),
        taxPercent: Number(quote.taxPercent),
        taxAmount: Number(quote.taxAmount),
        total: Number(quote.total),
        notes: quote.notes,
        paymentTerms: quote.paymentTerms,
        validUntil: quote.validUntil,
        createdAt: quote.createdAt,
      });
      const key = newStorageKey("quotes", `${quote.code}.pdf`);
      await storage().put(key, Buffer.from(pdfBytes), "application/pdf");
      await prisma.quote.update({ where: { id: quote.id }, data: { pdfKey: key } });
      pdfKey = key;
    }

    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: "SENT", sentAt: quote.sentAt ?? new Date() },
    });

    const recipient = quote.customer.whatsapp ?? quote.customer.phone;
    if (recipient) {
      const tpl = await getActiveTemplate("QUOTE_SENT_CUSTOMER");
      const vars = {
        name: quote.customer.name,
        quoteCode: quote.code,
        service: quote.service?.name ?? "your requirement",
        link: `${env.NEXT_PUBLIC_SITE_URL}/quote/${quote.publicToken}`,
        validUntil: quote.validUntil
          ? quote.validUntil.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
          : "soon",
      };
      await notificationService.queue({
        channel: "WHATSAPP",
        recipient,
        subject: `Quotation ${quote.code}`,
        body: tpl ? renderTemplate(tpl.body, vars) : `Hi ${vars.name}, your quotation ${vars.quoteCode} for ${vars.service}: ${vars.link}`,
        templateCode: tpl?.code,
        relatedType: "QUOTE",
        relatedId: quote.id,
        payload: { pdfKey },
      });
    }
  },
};

export type QuoteWithRelations = Prisma.PromiseReturnType<typeof quotesService.getByToken>;
