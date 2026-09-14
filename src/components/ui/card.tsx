import clsx from "clsx";
import type { ReactNode } from "react";

const toneMap: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-700",
  blue: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  violet: "bg-violet-50 text-violet-700",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap | string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneMap[tone] ?? toneMap.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PanelHeading({
  title,
  hint,
}: {
  title: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {hint && <p className="text-xs font-medium text-slate-400">{hint}</p>}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white shadow-card", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-slate-600">{subtitle}</p>}
    </div>
  );
}
