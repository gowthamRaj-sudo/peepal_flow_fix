import { prisma } from "@/lib/prisma";
import { QuoteCreateForm } from "@/features/admin/quote-create-form";

export const dynamic = "force-dynamic";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; jobId?: string; customerId?: string }>;
}) {
  const sp = await searchParams;

  let presetCustomerId = sp.customerId;
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, name: true, phone: true },
  });

  if (sp.leadId && !presetCustomerId) {
    const lead = await prisma.lead.findUnique({ where: { id: sp.leadId }, select: { customerId: true } });
    presetCustomerId = lead?.customerId ?? undefined;
  }
  if (sp.jobId && !presetCustomerId) {
    const job = await prisma.job.findUnique({ where: { id: sp.jobId }, select: { customerId: true } });
    presetCustomerId = job?.customerId ?? undefined;
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900">New quotation</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Itemised pricing for materials and labour. A professional PDF is generated when you send it.
        </p>
      </header>
      <QuoteCreateForm
        customers={customers}
        presetCustomerId={presetCustomerId}
        presetLeadId={sp.leadId}
        presetJobId={sp.jobId}
      />
    </div>
  );
}
