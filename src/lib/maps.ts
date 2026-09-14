export function mapsUrlFor(address: string | null, areaName?: string | null): string {
  const query = encodeURIComponent([address, areaName, "Chennai"].filter(Boolean).join(", "));
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}
