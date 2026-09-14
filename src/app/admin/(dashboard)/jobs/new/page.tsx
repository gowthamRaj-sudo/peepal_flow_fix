import { prisma } from "@/lib/prisma";
import { JobCreateForm } from "@/features/admin/job-create-form";

export const dynamic = "force-dynamic";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  const { leadId } = await searchParams;

  const [customers, services, areas, workers] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, phone: true },
    }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.serviceArea.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true, role: true }, orderBy: [{ role: "asc" }, { name: "asc" }] }),
  ]);

  let preset = {};
  if (leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        customer: true,
        service: true,
        area: { select: { name: true } },
      },
    });
    if (lead) {
      preset = {
        leadId,
        customerId: lead.customer?.id ?? undefined,
        serviceId: lead.customer ? lead.service.id : lead.service.id,
        title: `${lead.service.name} — ${lead.area?.name ?? lead.pincode ?? ""}`.trim(),
        address: lead.address ?? undefined,
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Schedule a job</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          The job appears instantly on the assigned worker&apos;s phone.
        </p>
      </header>
      <JobCreateForm
        customers={customers}
        services={services}
        areas={areas}
        workers={workers}
        preset={preset}
      />
    </div>
  );
}
