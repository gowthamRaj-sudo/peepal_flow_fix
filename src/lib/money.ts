export function formatInr(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatRange(min?: number | null, max?: number | null): string {
  if (min == null && max == null) return "On inspection";
  if (min != null && max != null) return `${formatInr(min)} – ${formatInr(max)}`;
  return formatInr((min ?? max)!);
}
