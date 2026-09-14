import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { StickyMobileCta } from "@/components/site/cta";
import { getPublicContact } from "@/server/settings";
import { JsonLd } from "@/components/site/json-ld";
import { BUSINESS, SITE_URL } from "@/config/business";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const contact = await getPublicContact().catch(() => null);

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Plumber", "Electrician"],
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    description: BUSINESS.supportLine,
    url: SITE_URL,
    telephone: contact?.phone || BUSINESS.phone,
    email: contact?.email || BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    areaServed: [
      { "@type": "City", name: "Chennai" },
      { "@type": "AdministrativeArea", name: "OMR, Chennai" },
      { "@type": "AdministrativeArea", name: "South Chennai" },
    ],
    openingHours: BUSINESS.openingHours,
    slogan: BUSINESS.tagline,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={localBusiness} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer contact={contact ?? undefined} />
      <StickyMobileCta />
    </div>
  );
}
