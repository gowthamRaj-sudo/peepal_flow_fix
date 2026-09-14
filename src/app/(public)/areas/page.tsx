import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getActiveAreas } from "@/server/catalog";
import { Breadcrumbs, PageHero } from "@/components/site/page-parts";
import { RequestServiceButton } from "@/components/site/cta";
import { breadcrumbJsonLd, JsonLd } from "@/components/site/json-ld";
import { SITE_URL } from "@/config/business";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Service Areas — Chennai & OMR Corridor",
  description:
    "Peepal Flow Fix Solutions serves Chennai and nearby areas including Sholinganallur, Navalur, Kelambakkam, Velachery, Tambaram, Adyar and more. See coverage details.",
  alternates: { canonical: "/areas" },
};

export default async function AreasPage() {
  const areas = await getActiveAreas();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Service Areas", url: `${SITE_URL}/areas` },
        ])}
      />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Service Areas" }]} />
      <PageHero
        eyebrow="Coverage"
        title="Areas we serve around Chennai"
        subtitle="We are a service-area business focused on South Chennai and the OMR corridor. Select your area to see services available there."
      >
        <RequestServiceButton size="lg" label="Check Availability in My Area" />
      </PageHero>

      <section className="container-page py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {areas.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/areas/${area.slug}`}
                className="group flex h-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-300 hover:shadow-md"
              >
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-brand-700">{area.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    Plumbing · Electrical · Bathroom renovation &amp; more
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-600">
          <p>
            Don&apos;t see your locality? We may still cover it — especially along OMR between
            Sholinganallur and Kelambakkam. Call us to confirm availability in your area.
          </p>
        </div>
      </section>
    </>
  );
}
