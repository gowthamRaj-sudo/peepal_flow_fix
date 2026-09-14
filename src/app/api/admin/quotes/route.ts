import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { quotesService } from "@/server/quotes.service";
import { quoteCreateSchema } from "@/lib/validation";
import { audit } from "@/server/audit";

export const runtime = "nodejs";

export const POST = withApi(
  async ({ req, user, ip }) => {
    const input = quoteCreateSchema.parse(await req.json().catch(() => null));

    const quote = await quotesService.create({
      customerId: input.customerId,
      leadId: input.leadId || undefined,
      jobId: input.jobId || undefined,
      serviceId: input.serviceId || undefined,
      workDescription: input.workDescription || undefined,
      materialsNote: input.materialsNote || undefined,
      discount: input.discount,
      taxPercent: input.taxPercent,
      notes: input.notes || undefined,
      paymentTerms: input.paymentTerms || undefined,
      validUntilDays: input.validUntilDays,
      items: input.items.map((item) => ({
        kind: item.kind,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
      })),
    });

    await audit({
      actorId: user!.id,
      action: "quote.created",
      entityType: "QUOTE",
      entityId: quote.id,
      ip,
    });

    return NextResponse.json({ id: quote.id, code: quote.code }, { status: 201 });
  },
  { roles: ["ADMIN", "STAFF"] },
);
