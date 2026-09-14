import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ProjectForm } from "@/features/admin/portfolio/project-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "New project", robots: { index: false, follow: false } };

export default async function NewAdminProjectPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN" && session.role !== "STAFF") redirect("/admin");

  const [services, areas] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.serviceArea.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Add a project</h1>
        <p className="mt-1 text-sm text-slate-500">Describe the job, then add before/after photos.</p>
      </header>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <ProjectForm services={services} areas={areas} />
      </div>
    </div>
  );
}