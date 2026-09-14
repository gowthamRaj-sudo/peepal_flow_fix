export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  let local = digits;
  if (local.length === 12 && local.startsWith("91")) local = local.slice(2);
  else if (local.length === 11 && local.startsWith("0")) local = local.slice(1);
  else if (local.length > 10 && local.startsWith("91")) local = local.slice(-10);
  if (local.length !== 10) return null;
  if (!/^[6-9]/.test(local)) return null;
  return `+91${local}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.length < 6) return "*****";
  return `${digits.slice(0, -5).replace(/\d(?=\d{2})/g, "*")}${digits.slice(-3)}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
