import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, PanelHeading } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProjectForm } from "@/features/admin/portfolio/project-form";
import { PhotoManager } from "@/features/admin/portfolio/photo-manager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit project", robots: { index: false, follow: false } };

export default async function EditAdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN" && session.role !== "STAFF") redirect("/admin");

  const [project, services, areas] = await Promise.all([
    prisma.portfolioProject.findUnique({
      where: { id },
      include: { photos: { orderBy: [{ stage: "asc" }, { sortOrder: "asc" }] } },
    }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.serviceArea.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{project.title}</h1>
          <p className="mt-0.5 font-mono text-xs text-slate-400">/projects/{project.slug}</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/projects/${project.slug}`} variant="outline" size="sm" external>
            View on site
          </LinkButton>
          <LinkButton href="/admin/projects" variant="ghost" size="sm">
            ← All projects
          </LinkButton>
        </div>
      </header>

      <Card className="p-5 sm:p-6">
        <PanelHeading title="Details" />
        <div className="mt-4">
          <ProjectForm
            services={services}
            areas={areas}
            initial={{
              id: project.id,
              title: project.title,
              slug: project.slug,
              description: project.description ?? "",
              materials: project.materials ?? "",
              serviceId: project.serviceId,
              areaId: project.areaId ?? "",
              completedOn: project.completedOn ? project.completedOn.toISOString().slice(0, 10) : "",
              isPublished: project.isPublished,
              sortOrder: project.sortOrder,
            }}
          />
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <PanelHeading title="Photos" hint="Before / during / after" />
        <div className="mt-4">
          <PhotoManager
            projectId={project.id}
            photos={project.photos.map((p) => ({
              id: p.id,
              stage: p.stage,
              caption: p.caption,
              sortOrder: p.sortOrder,
              storageKey: p.storageKey,
            }))}
          />
        </div>
      </Card>

      <p className="text-xs leading-relaxed text-slate-400">
        Public pages refresh within an hour of a change. Only published projects with at least one
        photo appear on the &quot;Our Work&quot; page.
      </p>
    </div>
  );
}