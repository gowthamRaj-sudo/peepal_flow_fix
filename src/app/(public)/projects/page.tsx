import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-parts";
import { RequestServiceButton } from "@/components/site/cta";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Work — Real Projects Around Chennai",
  description:
    "Genuine before-and-after projects by Peepal Flow Fix Solutions: bathroom renovations, leakage repairs and installations across Chennai.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof fetchProjects>> = [];
  try {
    projects = await fetchProjects();
  } catch {
    projects = [];
  }

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Real work, from real Chennai homes"
        subtitle="Every project below was completed by our team. We only publish work with the customer's permission."
      >
        <RequestServiceButton size="lg" label="Start Your Project" />
      </PageHero>

      <section className="container-page py-12">
        {projects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-lg font-semibold text-slate-700">Project gallery coming soon</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              We&apos;re currently photographing recent work with customer permission. In the
              meantime, call us — we&apos;ll happily describe similar jobs we&apos;ve done in your
              area.
            </p>
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.slug}`} className="group block h-full rounded-xl border border-slate-200 bg-white shadow-card transition hover:border-brand-300">
                  <div className="aspect-video overflow-hidden rounded-t-xl bg-slate-100">
                    {project.photos.find((p) => p.stage === "AFTER") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/files/${encodeURIComponent(project.photos.find((p) => p.stage === "AFTER")!.storageKey)}`}
                        alt={`${project.title} after completion`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">No photo yet</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-accent-600">
                      {project.area?.name ?? "Chennai"} · {project.service.name}
                    </p>
                    <h2 className="mt-1 font-bold text-slate-900 group-hover:text-brand-700">{project.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{project.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

async function fetchProjects() {
  const { prisma } = await import("@/lib/prisma");
  return prisma.portfolioProject.findMany({
    where: { isPublished: true },
    orderBy: [{ completedOn: "desc" }, { createdAt: "desc" }],
    include: {
      service: { select: { name: true } },
      area: { select: { name: true } },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
}
