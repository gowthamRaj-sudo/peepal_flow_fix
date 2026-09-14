import { PrismaClient, NotificationChannel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SERVICES = [
  { slug: "plumbing", name: "Plumbing Services", shortName: "Plumbing", sortOrder: 1 },
  { slug: "electrical", name: "Electrical Services", shortName: "Electrical", sortOrder: 2 },
  { slug: "bathroom-fittings", name: "Bathroom Fittings", shortName: "Fittings", sortOrder: 3 },
  { slug: "new-bathroom-installation", name: "New Bathroom Installation", shortName: "New Bathroom", sortOrder: 4 },
  { slug: "bathroom-renovation", name: "Bathroom Renovation", shortName: "Renovation", sortOrder: 5 },
  { slug: "bathroom-alteration", name: "Bathroom Alteration", shortName: "Alteration", sortOrder: 6 },
  { slug: "water-leakage-repair", name: "Water Leakage Repair", shortName: "Leak Repair", sortOrder: 7 },
  { slug: "home-maintenance", name: "General Home Maintenance", shortName: "Maintenance", sortOrder: 8 },
];

const AREAS: [string, string, number][] = [
  ["chennai", "Chennai", 1],
  ["kovalam", "Kovalam", 2],
  ["kelambakkam", "Kelambakkam", 3],
  ["muthukadu", "Muthukadu", 4],
  ["thiruporur", "Thiruporur", 5],
  ["navalur", "Navalur", 6],
  ["siruseri", "Siruseri", 7],
  ["sholinganallur", "Sholinganallur", 8],
  ["thoraipakkam", "Thoraipakkam", 9],
  ["perungudi", "Perungudi", 10],
  ["velachery", "Velachery", 11],
  ["medavakkam", "Medavakkam", 12],
  ["pallikaranai", "Pallikaranai", 13],
  ["tambaram", "Tambaram", 14],
  ["pallavaram", "Pallavaram", 15],
  ["adyar", "Adyar", 16],
  ["guindy", "Guindy", 17],
  ["porur", "Porur", 18],
];

const TEMPLATES: { code: string; name: string; channel: NotificationChannel; subject?: string; body: string }[] = [
  {
    code: "ENQUIRY_RECEIVED_CUSTOMER",
    name: "Enquiry received (to customer)",
    channel: "WHATSAPP",
    body:
      "Hi {{name}}, thank you for contacting Peepal Flow Fix Solutions. We've received your request for {{service}} in {{area}}. Our team will contact you shortly.",
  },
  {
    code: "NEW_ENQUIRY_ADMIN",
    name: "New enquiry alert (internal)",
    channel: "SMS",
    subject: "New Peepal Flow Fix enquiry {{code}}",
    body:
      "New Peepal Flow Fix enquiry {{code}}\nCustomer: {{name}}\nArea: {{area}}\nService: {{service}}\nPhone: {{phone}}\nPreferred time: {{preferredTime}}\nPhotos: {{photoCount}}\nOpen admin dashboard to respond.",
  },
  {
    code: "VISIT_SCHEDULED_CUSTOMER",
    name: "Visit scheduled (to customer)",
    channel: "WHATSAPP",
    body:
      "Hi {{name}}, your Peepal Flow Fix service visit is scheduled for {{date}} at {{time}}. Our technician will call before arriving. Reply here if you need to reschedule.",
  },
  {
    code: "TECHNICIAN_ON_THE_WAY",
    name: "Technician on the way (to customer)",
    channel: "WHATSAPP",
    body:
      "Hi {{name}}, your Peepal Flow Fix technician is on the way for today's visit ({{service}}). Expected arrival around {{time}}. Please keep the work area accessible.",
  },
  {
    code: "QUOTE_SENT_CUSTOMER",
    name: "Quote sent (to customer)",
    channel: "WHATSAPP",
    body:
      "Hi {{name}}, your quotation {{quoteCode}} for {{service}} is ready: {{link}}\nThe quote is valid until {{validUntil}}. Call us if you have questions.",
  },
  {
    code: "JOB_COMPLETED_CUSTOMER",
    name: "Job completed (to customer)",
    channel: "WHATSAPP",
    body:
      "Thank you for choosing Peepal Flow Fix Solutions, {{name}}. We hope you're happy with the completed {{service}} work at your home. Reach out anytime for future needs.",
  },
  {
    code: "REVIEW_REQUEST_CUSTOMER",
    name: "Review request (to customer)",
    channel: "WHATSAPP",
    body:
      "Hi {{name}}, thank you again for choosing Peepal Flow Fix Solutions. If you're happy with our service, we'd really appreciate your feedback on Google: {{reviewLink}} It takes under a minute and helps our small business a lot.",
  },
];

async function main() {
  console.log("Seeding Peepal Flow Fix platform...");

  const services: Record<string, string> = {};
  for (const s of SERVICES) {
    const row = await prisma.service.upsert({
      where: { slug: s.slug },
      update: { name: s.name, isActive: true, sortOrder: s.sortOrder },
      create: { slug: s.slug, name: s.name, tagline: s.shortName, sortOrder: s.sortOrder },
    });
    services[s.slug] = row.id;
  }

  const areaIds: Record<string, string> = {};
  for (const [slug, name, sortOrder] of AREAS) {
    const row = await prisma.serviceArea.upsert({
      where: { slug },
      update: { name, sortOrder },
      create: { slug, name, sortOrder },
    });
    areaIds[slug] = row.id;
  }

  // All services available in all seeded areas initially; admins can adjust.
  for (const areaId of Object.values(areaIds)) {
    for (const serviceId of Object.values(services)) {
      await prisma.areaService.upsert({
        where: { areaId_serviceId: { areaId, serviceId } },
        update: {},
        create: { areaId, serviceId },
      });
    }
  }

  for (const t of TEMPLATES) {
    await prisma.messageTemplate.upsert({
      where: { code: t.code },
      update: { name: t.name, channel: t.channel, subject: t.subject ?? null, body: t.body },
      create: { code: t.code, name: t.name, channel: t.channel, subject: t.subject ?? null, body: t.body },
    });
  }

  const users = [
    {
      name: "Peepal Flow Fix Admin",
      phone: "+919000000001",
      role: "ADMIN" as const,
      password: process.env.SEED_ADMIN_PASSWORD || "Admin@Dev123",
    },
    {
      name: "Front Desk",
      phone: "+919000000002",
      role: "STAFF" as const,
      password: process.env.SEED_STAFF_PASSWORD || "Staff@Dev123",
    },
    {
      name: "Field Supervisor",
      phone: "+919000000003",
      role: "FIELD_WORKER" as const,
      password: process.env.SEED_FIELD_PASSWORD || "Field@Dev123",
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: { passwordHash, role: u.role, name: u.name },
      create: { phone: u.phone, passwordHash, role: u.role, name: u.name },
    });
  }

  await prisma.setting.upsert({
    where: { key: "business_phone" },
    update: {},
    create: { key: "business_phone", value: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "" },
  });
  await prisma.setting.upsert({
    where: { key: "business_whatsapp" },
    update: {},
    create: { key: "business_whatsapp", value: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "" },
  });

  console.log("Seed complete.");
  console.log("Demo logins (change passwords immediately outside local dev):");
  console.log("  ADMIN        +919000000001 / Admin@Dev123");
  console.log("  STAFF        +919000000002 / Staff@Dev123");
  console.log("  FIELD_WORKER +919000000003 / Field@Dev123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
