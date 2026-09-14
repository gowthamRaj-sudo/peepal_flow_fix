import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs, PageHero } from "@/components/site/page-parts";
import { RequestServiceButton, WhatsAppButton } from "@/components/site/cta";
import { breadcrumbJsonLd, JsonLd } from "@/components/site/json-ld";
import { BUSINESS, SITE_URL } from "@/config/business";

export const revalidate = 3600;

async function getProject(slug: string) {
  return prisma.portfolioProject.findUnique({
    where: { slug },
    include: {
      service: { select: { name: true, slug: true } },
      area: { select: { name: true, slug: true } },
      photos: { orderBy: [{ stage: "asc" as const }, { sortOrder: "asc" as const }] },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await getProject(slug);
    if (!project || !project.isPublished) return {};
    return {
      title: `${project.title} — ${project.area?.name ?? "Chennai"}`,
      description: project.description.slice(0, 155),
      alternates: { canonical: `/projects/${project.slug}` },
    };
  } catch {
    return {};
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let project;
  try {
    project = await getProject(slug);
  } catch {
    notFound();
  }
  if (!project || !project.isPublished) notFound();

  const stages = [
    { key: "BEFORE", label: "Before", photos: project.photos.filter((p) => p.stage === "BEFORE") },
    { key: "DURING", label: "During work", photos: project.photos.filter((p) => p.stage === "DURING") },
    { key: "AFTER", label: "After", photos: project.photos.filter((p) => p.stage === "AFTER") },
  ].filter((s) => s.photos.length > 0);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Our Work", url: `${SITE_URL}/projects` },
          { name: project.title, url: `${SITE_URL}/projects/${project.slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Our Work", href: "/projects" },
          { name: project.title },
        ]}
      />
      <PageHero
        eyebrow={`${project.area?.name ?? "Chennai"} · ${project.service.name}`}
        title={project.title}
        subtitle={project.completedOn ? `Completed ${new Date(project.completedOn).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}` : undefined}
      >
        <div className="flex flex-wrap gap-3">
          <RequestServiceButton size="lg" label="Plan a Similar Project" />
          <WhatsAppButton size="lg" message={`Hi ${BUSINESS.name}, I saw the "${project.title}" project — I need something similar.`} />
        </div>
      </PageHero>

      <article className="container-page max-w-3xl py-10">
        <p className="whitespace-pre-wrap leading-relaxed text-slate-600">{project.description}</p>

        {stages.map((stage) => (
          <section key={stage.key} className="mt-8" aria-label={`${stage.label} photos`}>
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-600">{stage.label}</h2>
            <ul role="list" className="mt-3 grid gap-3 sm:grid-cols-2">
              {stage.photos.map((photo) => (
                <li key={photo.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/files/${encodeURIComponent(photo.storageKey)}`}
                    alt={`${project.title} — ${photo.caption ?? stage.label.toLowerCase()}`}
                    loading="lazy"
                    className="w-full rounded-xl object-cover shadow-card"
                  />
                  {photo.caption && <p className="mt-1.5 text-xs text-slate-400">{photo.caption}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {project.materials && (
          <section className="mt-8 rounded-xl bg-slate-50 p-5" aria-label="Materials used">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Materials used</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{project.materials}</p>
          </section>
        )}
      </article>
    </>
  );
}
