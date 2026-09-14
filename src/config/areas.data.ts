export interface AreaContent {
  slug: string;
  name: string;
  district: string;
  context: string;
  sortOrder: number;
}

export const AREAS_CONTENT: AreaContent[] = [
  {
    slug: "chennai",
    name: "Chennai",
    district: "Chennai",
    context:
      "From heritage homes in Mylapore to new apartments along the IT corridors, Chennai homes mix very old plumbing with very new fittings. We work across the city with focus on South Chennai.",
    sortOrder: 1,
  },
  {
    slug: "kovalam",
    name: "Kovalam",
    district: "Chengalpattu",
    context:
      "The coastal salt air around Kovalam is tough on taps, fittings and external pipelines — corrosion-related leaks and fitting replacement are among the most common jobs we handle here.",
    sortOrder: 2,
  },
  {
    slug: "kelambakkam",
    name: "Kelambakkam",
    district: "Chengalpattu",
    context:
      "With rapid apartment growth on the Kelambakkam–OMR stretch, we regularly handle new bathroom installations, builder-quality rectification and leakage repair in this area.",
    sortOrder: 3,
  },
  {
    slug: "muthukadu",
    name: "Muthukadu",
    district: "Chengalpattu",
    context:
      "Homes around Muthukadu often depend on borewells, sumps and overhead tanks — pump connections, tank plumbing and pressure problems are frequent requirements here.",
    sortOrder: 4,
  },
  {
    slug: "thiruporur",
    name: "Thiruporur",
    district: "Chengalpattu",
    context:
      "Independent houses and new constructions around Thiruporur keep us busy with complete bathroom installation and drainage line work for newly built floors.",
    sortOrder: 5,
  },
  {
    slug: "navalur",
    name: "Navalur",
    district: "Kanchipuram/Chengalpattu",
    context:
      "Navalur's dense apartment belt means constant demand for bathroom renovation, concealed leak detection and quick plumbing repairs that fit around working families' schedules.",
    sortOrder: 6,
  },
  {
    slug: "siruseri",
    name: "Siruseri",
    district: "Kanchipuram/Chengalpattu",
    context:
      "Around SIPCOT Siruseri, many young homeowners are buying their first flats — we handle move-in fixes, bathroom upgrades and everything between in this area.",
    sortOrder: 7,
  },
  {
    slug: "sholinganallur",
    name: "Sholinganallur",
    district: "Kanchipuram/Chengalpattu",
    context:
      "One of our busiest areas. Between older independent homes and high-rise apartments, Sholinganallur keeps our teams occupied with renovations, leakage repairs and electrical work.",
    sortOrder: 8,
  },
  {
    slug: "thoraipakkam",
    name: "Thoraipakkam",
    district: "Kanchipuram/Chengalpattu",
    context:
      "Along OMR's Thoraipakkam stretch, water pressure varies widely between ground and upper floors — shower and pressure-related upgrades plus leak repairs are common here.",
    sortOrder: 9,
  },
  {
    slug: "perungudi",
    name: "Perungudi",
    district: "Kanchipuram/Chengalpattu",
    context:
      "Perungudi's mix of older houses and newer apartments gives us steady work in pipe re-routing, switchboard upgrades and full bathroom modernisation.",
    sortOrder: 10,
  },
  {
    slug: "velachery",
    name: "Velachery",
    district: "Chennai",
    context:
      "Velachery's low-lying pockets face monsoon waterlogging stress on drains and sump lines — preventive maintenance and drainage work are especially valuable here.",
    sortOrder: 11,
  },
  {
    slug: "medavakkam",
    name: "Medavakkam",
    district: "Kanchipuram/Chengalpattu",
    context:
      "Fast-growing Medavakkam has thousands of recently built apartments where builder-grade fittings need upgrading within a few years of possession.",
    sortOrder: 12,
  },
  {
    slug: "pallikaranai",
    name: "Pallikaranai",
    district: "Kanchipuram/Chengalpattu",
    context:
      "The marsh-adjacent humidity in Pallikaranai accelerates seepage damage — early leakage diagnosis saves walls and wardrobes in this area.",
    sortOrder: 13,
  },
  {
    slug: "tambaram",
    name: "Tambaram",
    district: "Chengalpattu",
    context:
      "Tambaram's established residential neighbourhoods have mature homes needing pipeline renewals, rewiring support and bathroom alterations for joint families.",
    sortOrder: 14,
  },
  {
    slug: "pallavaram",
    name: "Pallavaram",
    district: "Chengalpattu",
    context:
      "Around Pallavaram, older independent houses frequently need complete electrical safety checks alongside plumbing updates as buildings age.",
    sortOrder: 15,
  },
  {
    slug: "adyar",
    name: "Adyar",
    district: "Chennai",
    context:
      "Adyar's classic homes deserve careful renovation — we handle heritage-conscious bathroom updates and concealed pipe replacements with extra care for existing finishes.",
    sortOrder: 16,
  },
  {
    slug: "guindy",
    name: "Guindy",
    district: "Chennai",
    context:
      "Guindy's mix of staff quarters, older apartments and renovated homes keeps our maintenance crews active across plumbing and electrical jobs year-round.",
    sortOrder: 17,
  },
  {
    slug: "porur",
    name: "Porur",
    district: "Chennai",
    context:
      "West-chennai Porur's construction boom means both new bathroom installations and snag-list rectification work form a large share of our jobs here.",
    sortOrder: 18,
  },
];

export function getAreaContent(slug: string): AreaContent | undefined {
  return AREAS_CONTENT.find((a) => a.slug === slug);
}
