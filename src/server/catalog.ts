import { prisma } from "@/lib/prisma";
import { SERVICES_CONTENT } from "@/config/services.data";
import { AREAS_CONTENT } from "@/config/areas.data";

export interface CatalogService {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
}

export interface CatalogArea {
  id: string;
  slug: string;
  name: string;
  context: string | null;
}

export async function getActiveServices(): Promise<CatalogService[]> {
  try {
    return await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true, tagline: true },
    });
  } catch {
    return SERVICES_CONTENT.map((s, i) => ({
      id: s.slug,
      slug: s.slug,
      name: s.name,
      tagline: s.tagline,
    }));
  }
}

export async function getActiveAreas(): Promise<CatalogArea[]> {
  try {
    return await prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true, context: true },
    });
  } catch {
    return AREAS_CONTENT.map((a) => ({ id: a.slug, slug: a.slug, name: a.name, context: a.context }));
  }
}

export async function getAreaBySlug(slug: string): Promise<CatalogArea | null> {
  const areas = await getActiveAreas();
  return areas.find((a) => a.slug === slug) ?? null;
}
