"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { FieldJob } from "@/server/field-jobs";

function timeLabel(d: Date | string | null): string {
  if (!d) return "Any time";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function FieldJobCard({ job, muted, done }: { job: FieldJob; muted?: boolean; done?: boolean }) {
  const statusPill = done
    ? "bg-emerald-500/15 text-emerald-400"
    : job.status === "IN_PROGRESS"
      ? "bg-violet-500/15 text-violet-300"
      : "bg-brand-500/15 text-brand-300";

  return (
    <Link
      href={`/field/jobs/${job.id}`}
      className={`mb-3 block rounded-2xl bg-slate-800 p-4 transition active:scale-[0.99] ${
        done ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`truncate text-lg font-bold ${done ? "text-slate-400" : "text-white"}`}>
            {job.customer.name}
          </p>
          <p className="mt-0.5 truncate text-sm text-slate-400">
            {job.area?.name ?? "Chennai"} · {job.service.name.replace(" Services", "")}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${statusPill}`}>
          {timeLabel(job.scheduledFor)}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className={`truncate text-xs font-medium ${done ? "text-slate-500" : "text-slate-300"}`}>
          {job.title}
        </p>
        {!done && (
          <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-white">
            <MapPin className="h-3 w-3" aria-hidden /> OPEN
          </span>
        )}
      </div>
      {muted && <p className="mt-2 text-[11px] font-semibold text-brand-400">Scheduled on another day</p>}
    </Link>
  );
}
