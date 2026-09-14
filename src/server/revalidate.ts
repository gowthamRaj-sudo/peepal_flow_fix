import { revalidatePath } from "next/cache";

export function refreshProjectPages(existingSlug?: string | null, newSlug?: string) {
  revalidatePath("/", "page");
  revalidatePath("/projects", "page");
  for (const slug of new Set([existingSlug, newSlug])) {
    if (slug) revalidatePath(`/projects/${slug}`, "page");
  }
}