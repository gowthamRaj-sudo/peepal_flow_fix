import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/business";
import { SERVICES_CONTENT } from "@/config/services.data";
import { getActiveAreas } from "@/server/catalog";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/services`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/areas`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/request-service`, changeFrequency: "yearly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES_CONTENT.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  let areaRoutes: MetadataRoute.Sitemap = [];
  let areaServiceRoutes: MetadataRoute.Sitemap = [];
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const areas = await prisma.serviceArea.findMany({ where: { isActive: true }, select: { slug: true } });
    areaRoutes = areas.map((a) => ({
      url: `${SITE_URL}/areas/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    // Only include service+area combos where genuinely useful (top areas).
    const topAreas = await prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 10,
      select: { slug: true },
      });
    const comboServices = ["plumbing", "bathroom-renovation", "water-leakage-repair", "new-bathroom-installation"];
    areaServiceRoutes = topAreas.flatMap((a) =>
      comboServices.map((s) => ({
        url: `${SITE_URL}/areas/${a.slug}/${s}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    );

    const projects = await prisma.portfolioProject.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    projectRoutes = projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }));
  } catch {
    // DB unavailable at build time — static routes still ship.
  }

  return [...staticRoutes, ...serviceRoutes, ...areaRoutes, ...areaServiceRoutes, ...projectRoutes];
}
