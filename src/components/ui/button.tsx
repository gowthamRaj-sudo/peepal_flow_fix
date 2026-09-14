import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp" | "danger";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  secondary: "bg-accent-500 text-white hover:bg-accent-600",
  outline: "border border-brand-600 text-brand-700 bg-white hover:bg-brand-50",
  ghost: "text-slate-600 hover:text-brand-700 hover:bg-slate-100",
  whatsapp: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 min-h-[36px]",
  md: "text-sm px-4 py-2.5 min-h-[44px]",
  lg: "text-base px-6 py-3 min-h-[48px]",
  xl: "text-base px-7 py-3.5 min-h-[56px]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
  prefetch?: boolean;
  onClick?: () => void;
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external,
}: LinkButtonProps) {
  const classes = buttonClasses(variant, size, className);
  if (external || href.startsWith("tel:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
