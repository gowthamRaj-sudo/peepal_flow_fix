import type { Lead, PreferredTime } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/errors";
import { nextCode } from "@/lib/codes";
import { logger } from "@/lib/logger";
import { notificationService } from "@/services/notifications";
import { getActiveTemplate, renderTemplate } from "@/services/templates";

export interface CreateLeadInput {
  serviceSlug: string;
  areaSlug?: string | null;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  description: string;
  address: string;
  pincode: string;
  preferredTime: PreferredTime;
  uploadIds?: string[];
  consent: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
}

function formatSlot(preferredTime: PreferredTime): string {
  switch (preferredTime) {
    case "MORNING":
      return "Morning";
    case "AFTERNOON":
      return "Afternoon";
    case "EVENING":
      return "Evening";
    default:
      return "Flexible";
  }
}

export const leadsService = {
  async create(input: CreateLeadInput): Promise<Lead> {
    const service = await prisma.service.findUnique({ where: { slug: input.serviceSlug } });
    if (!service || !service.isActive) throw badRequest("Selected service is not available");

    let area = null;
    if (input.areaSlug) {
      area = await prisma.serviceArea.findUnique({ where: { slug: input.areaSlug } });
      if (!area || !area.isActive) {
        area = null;
        logger.warn("lead.unknown_area", { slug: input.areaSlug });
      }
    }

    // Attach only uploads that are not already bound to a lead.
    let uploadIds = input.uploadIds ?? [];
    if (uploadIds.length) {
      const valid = await prisma.upload.findMany({
        where: { id: { in: uploadIds }, leadId: null },
        select: { id: true },
      });
      uploadIds = valid.map((v) => v.id);
    }

    const code = await nextCode("lead");

    const lead = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone: input.phone },
        update: { name: input.customerName, whatsapp: input.whatsapp ?? undefined },
        create: {
          name: input.customerName,
          phone: input.phone,
          whatsapp: input.whatsapp ?? null,
          email: input.email ?? null,
          address: input.address,
          pincode: input.pincode,
          areaId: area?.id ?? null,
          source: "WEBSITE",
        },
        select: { id: true },
      });

      return tx.lead.create({
        data: {
          code,
          customerName: input.customerName,
          phone: input.phone,
          whatsapp: input.whatsapp ?? null,
          email: input.email ?? null,
          address: input.address,
          pincode: input.pincode,
          description: input.description,
          preferredTime: input.preferredTime,
          source: "WEBSITE",
          consent: true,
          utmSource: input.utmSource ?? null,
          utmMedium: input.utmMedium ?? null,
          utmCampaign: input.utmCampaign ?? null,
          landingPage: input.landingPage ?? null,
          serviceId: service.id,
          areaId: area?.id ?? null,
          customerId: customer.id,
          uploads: uploadIds.length
            ? { connect: uploadIds.map((id) => ({ id })) }
            : undefined,
        },
      });
    });

    await this.sendEnquiryNotifications(lead.id);
    return lead;
  },

  async sendEnquiryNotifications(leadId: string): Promise<void> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        service: { select: { name: true } },
        area: { select: { name: true } },
        _count: { select: { uploads: true } },
      },
    });
    if (!lead) return;

    const ownerPhone = process.env.OWNER_ALERT_PHONE || process.env.ADMIN_ALERT_SMS || "";
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || "";
    const vars = {
      name: lead.customerName,
      code: lead.code,
      service: lead.service.name,
      area: lead.area?.name ?? lead.pincode ?? "Chennai",
      phone: lead.phone,
      preferredTime: formatSlot(lead.preferredTime),
      photoCount: String(lead._count.uploads),
    };

    try {
      const adminTpl = await getActiveTemplate("NEW_ENQUIRY_ADMIN");
      if (adminTpl && ownerPhone) {
        const row = await notificationService.queue({
          channel: adminTpl.channel,
          recipient: ownerPhone,
          subject: adminTpl.subject ? renderTemplate(adminTpl.subject, vars) : undefined,
          body: renderTemplate(adminTpl.body, vars),
          templateCode: adminTpl.code,
          relatedType: "LEAD",
          relatedId: lead.id,
        });
        void notificationService.deliver(row.id).catch((e) => logger.error("notify.admin", { err: e }));
      }
      if (!adminTpl && ownerPhone) {
        const row = await notificationService.queue({
          channel: "SMS",
          recipient: ownerPhone,
          body: `New Peepal Flow Fix enquiry ${vars.code}\nCustomer: ${vars.name}\nArea: ${vars.area}\nService: ${vars.service}\nPhone: ${vars.phone}\nPreferred time: ${vars.preferredTime}\nPhotos: ${vars.photoCount}`,
          relatedType: "LEAD",
          relatedId: lead.id,
        });
        void notificationService.deliver(row.id).catch(() => {});
      }
      if (adminEmail) {
        const row = await notificationService.queue({
          channel: "EMAIL",
          recipient: adminEmail,
          subject: `New enquiry ${vars.code} — ${vars.service} in ${vars.area}`,
          body: `Customer: ${vars.name}\nPhone: ${vars.phone}\nArea: ${vars.area}\nPincode: ${lead.pincode}\nService: ${vars.service}\nPreferred time: ${vars.preferredTime}\nPhotos: ${vars.photoCount}\n\nProblem:\n${lead.description ?? "-"}\n\nAddress: ${lead.address}`,
          relatedType: "LEAD",
          relatedId: lead.id,
        });
        void notificationService.deliver(row.id).catch(() => {});
      }

      const customerTpl =
        lead.whatsapp &&
        (await getActiveTemplate("ENQUIRY_RECEIVED_CUSTOMER"));
      if (customerTpl && lead.whatsapp) {
        const row = await notificationService.queue({
          channel: "WHATSAPP",
          recipient: lead.whatsapp,
          body: renderTemplate(customerTpl.body, vars),
          templateCode: customerTpl.code,
          relatedType: "LEAD",
          relatedId: lead.id,
        });
        void notificationService.deliver(row.id).catch(() => {});
      }
    } catch (e) {
      logger.error("leads.notify_failed", { err: e, leadId });
    }
  },

  async getLeadForAdmin(id: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        service: true,
        area: true,
        assignedTo: { select: { id: true, name: true, role: true } },
        customer: true,
        uploads: true,
        notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" as const } },
        jobs: { select: { id: true, code: true, status: true } },
        quotes: { select: { id: true, code: true, status: true, total: true } },
      },
    });
    if (!lead) throw notFound("Lead not found");
    return lead;
  },
};
