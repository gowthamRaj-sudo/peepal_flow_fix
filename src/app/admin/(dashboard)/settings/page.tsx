import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/server/settings";
import { PanelHeading } from "@/components/ui/card";
import { SettingsForm } from "@/features/admin/settings-form";
import { AreaManager } from "@/features/admin/area-manager";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/admin");

  const settings = await getSettings();
  const [areas, leadCounts] = await Promise.all([
    prisma.serviceArea.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, slug: true, isActive: true } }),
    prisma.lead.groupBy({ by: ["areaId"], _count: { _all: true } }),
  ]);
  const countMap = new Map(leadCounts.map((c) => [c.areaId, c._count._all]));

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Business details used across the website and customer messages.</p>
      </header>

      <section aria-label="Business information" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <PanelHeading title="Business information" />
        <div className="mt-4">
          <SettingsForm
            initial={{
              business_phone: settings.phone,
              business_whatsapp: settings.whatsapp,
              business_email: settings.email,
              working_hours: settings.workingHours,
              google_review_url: settings.googleReviewUrl,
              review_request_delay_days: settings.reviewRequestDelayDays,
            }}
          />
        </div>
      </section>

      <section aria-label="Service areas">
        <PanelHeading title="Service areas" hint="Active areas appear on the website and in the sitemap" />
        <AreaManager
          areas={areas.map((a) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            isActive: a.isActive,
            leadCount: countMap.get(a.id) ?? 0,
          }))}
        />
      </section>

      <p className="text-xs leading-relaxed text-slate-400">
        Changes take effect immediately on the live site (cached pages refresh within an hour).
        Message templates are managed under Templates in the sidebar.
      </p>
    </div>
  );
}
