import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProjectRowActions } from "@/features/admin/portfolio/project-actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Projects", robots: { index: false, follow: false } };

export default async function AdminProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN" && session.role !== "STAFF") redirect("/admin");

  const projects = await prisma.portfolioProject.findMany({
    orderBy: [{ sortOrder: "asc" }, { completedOn: "desc" }, { createdAt: "desc" }],
    include: {
      service: { select: { name: true } },
      area: { select: { name: true } },
      photos: {
        orderBy: [{ stage: "asc" }, { sortOrder: "asc" }],
        select: { id: true, stage: true, storageKey: true },
      },
      _count: { select: { photos: true } },
    },
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">
            {projects.length} project{projects.length === 1 ? "" : "s"} · only published ones
            show on the website
          </p>
        </div>
        <LinkButton href="/admin/projects/new">Add project</LinkButton>
      </header>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-5 py-3 font-medium">Project</th>
                <th scope="col" className="px-5 py-3 font-medium">Service / Area</th>
                <th scope="col" className="px-5 py-3 font-medium">Photos</th>
                <th scope="col" className="px-5 py-3 font-medium">Completed</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects.map((project) => {
                const after = project.photos.find((p) => p.stage === "AFTER") ?? project.photos[0];
                return (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {after ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/files/${encodeURIComponent(after.storageKey)}`}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                              no photo
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/projects/${project.id}`} className="block font-semibold text-slate-800 hover:text-brand-700">
                            {project.title}
                          </Link>
                          <span className="block font-mono text-xs text-slate-400">/projects/{project.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="block text-slate-700">{project.service.name}</span>
                      <span className="block text-xs text-slate-400">{project.area?.name ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{project._count.photos}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">
                      {project.completedOn ? new Date(project.completedOn).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <ProjectRowActions id={project.id} isPublished={project.isPublished} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {projects.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-slate-400">
            No projects yet. Add your first real project to start filling the &quot;Our Work&quot; page.
          </p>
        )}
      </Card>
    </div>
  );
}