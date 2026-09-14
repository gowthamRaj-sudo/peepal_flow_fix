import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TemplatesEditor } from "@/features/admin/templates-editor";
import { PanelHeading } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Templates",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/admin");

  const templates = await prisma.messageTemplate.findMany({
    orderBy: { createdAt: "asc" },
    select: { code: true, name: true, channel: true, body: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Message templates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customer messages sent over WhatsApp/SMS. Edits apply to the next queued message.
        </p>
      </header>
      <PanelHeading title="All templates" hint={`${templates.length} active`} />
      <TemplatesEditor
        templates={templates.map((t) => ({ ...t, channel: String(t.channel) }))}
      />
    </div>
  );
}
