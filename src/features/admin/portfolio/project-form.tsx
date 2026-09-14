"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

export interface PortfolioProjectInitial {
  id?: string;
  title: string;
  slug: string;
  description: string;
  materials: string;
  serviceId: string;
  areaId: string;
  completedOn: string;
  isPublished: boolean;
  sortOrder: number;
}

export function ProjectForm({
  services,
  areas,
  initial,
}: {
  services: { id: string; name: string }[];
  areas: { id: string; name: string }[];
  initial?: PortfolioProjectInitial;
}) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioProjectInitial>(
    initial ?? {
      title: "",
      slug: "",
      description: "",
      materials: "",
      serviceId: "",
      areaId: "",
      completedOn: "",
      isPublished: false,
      sortOrder: 0,
    },
  );

  const set = <K extends keyof PortfolioProjectInitial>(key: K, value: PortfolioProjectInitial[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    if (form.title.trim().length < 2) {
      setError("Give the project a title");
      return;
    }
    if (!form.serviceId) {
      setError("Choose the service this project belongs to");
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      materials: form.materials.trim(),
      serviceId: form.serviceId,
      areaId: form.areaId || undefined,
      completedOn: form.completedOn || undefined,
      isPublished: form.isPublished,
      sortOrder: form.sortOrder || 0,
    };
    try {
      const res = await fetch(editing ? `/api/admin/projects/${initial!.id}` : "/api/admin/projects", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { id?: string; error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Could not save the project");
        return;
      }
      router.push(editing ? `/admin/projects/${initial!.id}` : `/admin/projects/${data!.id}`);
      router.refresh();
    } catch {
      setError("Network problem while saving. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project title" required htmlFor="pj-title">
          <Input
            id="pj-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={160}
            placeholder="e.g. Full bathroom renovation, Thiruporur"
          />
        </Field>
        <Field
          label="URL slug"
          hint="Leave empty to generate from the title"
          htmlFor="pj-slug"
        >
          <Input
            id="pj-slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            maxLength={120}
            placeholder="bathroom-renovation-thiruporur"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Service" required htmlFor="pj-service">
          <Select id="pj-service" value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)}>
            <option value="">Select service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Area" htmlFor="pj-area">
          <Select id="pj-area" value={form.areaId} onChange={(e) => set("areaId", e.target.value)}>
            <option value="">Select area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Completed on" htmlFor="pj-completed">
          <Input
            id="pj-completed"
            type="date"
            value={form.completedOn}
            onChange={(e) => set("completedOn", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Description" hint="Shown on the project page. 2–4 sentences works best." htmlFor="pj-desc">
        <Textarea
          id="pj-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="What was done, the challenge, and the result…"
        />
      </Field>

      <Field label="Materials used" hint="Optional — shown at the bottom of the project page." htmlFor="pj-materials">
        <Textarea
          id="pj-materials"
          value={form.materials}
          onChange={(e) => set("materials", e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="e.g. Jaquar mixer, PVC pipes, anti-leak membrane…"
        />
      </Field>

      <div className="flex flex-wrap items-end gap-4">
        <Field label="Sort order" hint="Lower numbers appear first" htmlFor="pj-sort">
          <Input
            id="pj-sort"
            type="number"
            min={0}
            max={9999}
            className="w-28"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
          />
        </Field>
        <label className="mb-2.5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
            className="h-4 w-4 rounded accent-brand-600"
          />
          Published on the website
        </label>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={() => void save()} disabled={busy} size="lg">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {editing ? "Save changes" : "Create project"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()} disabled={busy}>
          Cancel
        </Button>
      </div>
    </div>
  );
}