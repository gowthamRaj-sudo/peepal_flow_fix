export interface ServiceContent {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  description: string[];
  commonProblems: string[];
  weHandle: string[];
  process: { title: string; detail: string }[];
  faqs: { q: string; a: string }[];
  priceMin?: number;
  priceMax?: number;
}

export const SERVICES_CONTENT: ServiceContent[] = [
  {
    slug: "plumbing",
    name: "Plumbing Services",
    shortName: "Plumbing",
    tagline: "Leaks, blockages, taps, pipes and full plumbing repairs",
    metaTitle: "Plumber in Chennai | Plumbing Services - Peepal Flow Fix Solutions",
    metaDescription:
      "Experienced plumbers for leak repair, blocked drains, tap and pipe work across Chennai. 25+ years of hands-on experience. Same-day visits. Call or request a quote online.",
    description: [
      "Water problems rarely fix themselves. A small drip under the sink or a slow drain today usually becomes water damage and an expensive repair later.",
      "Our plumbing team handles everything from a single leaking tap to complete pipe rework in apartments and independent houses. With more than two decades of hands-on work across Chennai homes, we diagnose the real cause first, then fix it properly — no patch jobs that fail again in a month.",
    ],
    commonProblems: [
      "Leaking taps, mixers and shower heads that never fully close",
      "Blocked kitchen sinks, bathroom drains and toilets",
      "Low water pressure in taps and showers",
      "Concealed pipe leaks showing up as damp patches on walls",
      "Overhead and underground water tank overflow issues",
      "Toilet flush tanks that keep running or won't refill",
      "Noisy pipes and water hammer sounds",
      "Sewage line backflow and foul smells from floor traps",
    ],
    weHandle: [
      "Leak detection and repair for visible and concealed pipelines",
      "Tap, mixer, shower and faucet replacement of any brand",
      "Drain cleaning and blockage removal without damaging tiles",
      "CPVC, PVC and GI pipeline installation and re-routing",
      "Flush tank repair and replacement",
      "Water tank connection, overflow and inlet pipe work",
      "Bathroom and kitchen plumbing point additions",
      "Motor and pump plumbing connections",
    ],
    process: [
      { title: "Tell us the problem", detail: "Call, WhatsApp or submit the form with photos if possible." },
      { title: "Site inspection", detail: "We visit, inspect and identify the root cause before quoting." },
      { title: "Clear quotation", detail: "You get a written price for materials and labour before work starts." },
      { title: "Repair and testing", detail: "We complete the work and test everything in front of you." },
      { title: "Clean-up and handover", detail: "We leave the work area clean and share maintenance tips." },
    ],
    faqs: [
      {
        q: "How quickly can a plumber reach my home in Chennai?",
        a: "For most areas in South Chennai and OMR we can arrange a same-day or next-morning visit. Emergency leaks are prioritised — call us directly for the fastest response.",
      },
      {
        q: "Do you charge for inspection?",
        a: "A small inspection fee may apply for diagnosis visits, and it is adjusted against the final bill when you proceed with the work. You always know the amount before we start.",
      },
      {
        q: "Will I get a quotation before the work begins?",
        a: "Yes. For anything beyond minor repairs we give a written quotation covering materials and labour so there are no surprises later.",
      },
      {
        q: "Do you provide materials or should I buy them?",
        a: "Both options are fine. We can supply branded fittings at transparent prices, or fit materials you have already purchased.",
      },
    ],
  },
  {
    slug: "electrical",
    name: "Electrical Services",
    shortName: "Electrical",
    tagline: "Wiring, switchboards, fans, lights and safe electrical repairs",
    metaTitle: "Electrician in Chennai | Electrical Services - Peepal Flow Fix Solutions",
    metaDescription:
      "Safe electrical repairs, wiring, switchboard, fan and light installation by experienced electricians across Chennai. Transparent pricing. Book a visit online or call now.",
    description: [
      "Electrical work is not a place for guesswork. Faulty wiring, loose joints and overloaded circuits are among the most common causes of household accidents.",
      "Our electricians handle day-to-day electrical repairs as well as complete wiring for renovations — done neatly, safely and up to standard practice. Every job is tested before handover, and we explain exactly what was done.",
    ],
    commonProblems: [
      "Frequent MCB tripping or fuse blowing",
      "Sparks or burning smell from switches and sockets",
      "Fans running slow or making noise",
      "Lights flickering or bulbs failing frequently",
      "Switchboards with loose plates and exposed wiring",
      "Inverter and UPS wiring problems",
      "Geysers and appliances tripping the mains",
      "Old aluminium wiring needing safe replacement",
    ],
    weHandle: [
      "Fault finding and safe repair of short circuits",
      "New switchboard, socket and switch installation",
      "Ceiling fan, exhaust fan, chimney and light fitting installation",
      "Concealed and surface wiring for new rooms and renovations",
      "MCB, distribution board upgrade and earthing checks",
      "Geyser, water pump and appliance electrical connections",
      "Inverter and UPS wiring setup",
      "Doorbell, calling bell and small fixture repairs",
    ],
    process: [
      { title: "Describe the issue", detail: "Tell us what is happening — photos help us prepare better." },
      { title: "Inspection and diagnosis", detail: "We check the circuit, load and wiring condition at your home." },
      { title: "Upfront estimate", detail: "You approve the price before any work starts." },
      { title: "Repair or installation", detail: "Work is done with proper tools, insulation and safety checks." },
      { title: "Testing and explanation", detail: "We demonstrate everything works and share safety advice." },
    ],
    faqs: [
      {
        q: "Is electrical work dangerous to attempt myself?",
        a: "Yes. Even seemingly simple jobs like changing a switch involve live wires. We strongly recommend professional handling for all electrical repairs beyond replacing a bulb.",
      },
      {
        q: "Can you rewire an old flat during renovation?",
        a: "Absolutely. Rewiring during bathroom or kitchen renovation is common work for us, including new points for geysers, mirrors lights and exhaust fans.",
      },
      {
        q: "Why does my MCB trip again and again?",
        a: "Repeated tripping usually means overloading, earth leakage or a weak MCB. It needs proper diagnosis rather than just switching it back on — we can find the exact cause.",
      },
      {
        q: "Which areas do you cover for electrical work?",
        a: "All of Chennai with focus on South Chennai and the OMR corridor — Sholinganallur, Navalur, Kelambakkam, Velachery, Tambaram, Adyar and nearby areas.",
      },
    ],
  },
  {
    slug: "bathroom-fittings",
    name: "Bathroom Fittings",
    shortName: "Fittings",
    tagline: "Taps, showers, sanitaryware and accessories installed right",
    metaTitle: "Bathroom Fitting Services in Chennai - Peepal Flow Fix Solutions",
    metaDescription:
      "Professional installation of taps, showers, sanitaryware and bathroom accessories in Chennai. Brand guidance, neat fitting and leak-tested finishing. Get a free quote.",
    description: [
      "Good fittings make daily life comfortable — and badly installed ones cause drips, wall damage and repeated plumber calls.",
      "We install complete bathroom fittings packages: taps, mixers, showers, health faucets, towel rods, mirrors and sanitaryware. If you are confused between brands and models, we guide you based on your budget and water pressure conditions, not showroom upselling.",
    ],
    commonProblems: [
      "New fittings leaking within weeks of poor installation",
      "Wrong-sized taps bought for existing pipe points",
      "Weak shower spray due to pressure mismatch",
      "Rusty or corroded old fixtures spoiling the bathroom look",
      "Loose towel rods, mirrors and accessories falling off tiles",
      "Health faucet and jet spray leaks",
    ],
    weHandle: [
      "Complete fittings package installation for new bathrooms",
      "Tap, mixer and diverter replacement",
      "Overhead and hand shower installation with pressure checks",
      "Sanitaryware fitting — wash basins, EWC, urinals",
      "Mirrors, cabinets, shelves and accessory fixing on tiles",
      "Angle valve, connecting hose and waste coupling replacement",
      "Guidance on selecting fittings suited to your budget",
    ],
    process: [
      { title: "Share your requirement", detail: "Tell us which fittings you need installed or replaced." },
      { title: "Point check", detail: "We verify pipe points, sizes and water pressure compatibility." },
      { title: "Selection support", detail: "Optional help choosing models within your budget." },
      { title: "Neat installation", detail: "Fitted with proper sealing, alignment and torque." },
      { title: "Leak test", detail: "Every joint is pressure-tested before we leave." },
    ],
    faqs: [
      {
        q: "Can you install fittings I bought online?",
        a: "Yes. Show us the items before purchase if unsure — some online products don't match Indian pipe sizes. Installation charges depend on the number of items.",
      },
      {
        q: "How long does a full fittings installation take?",
        a: "A typical bathroom with 8–12 items takes half to one full day, provided pipe points are ready.",
      },
      {
        q: "Do you warranty the installation work?",
        a: "Our workmanship is guaranteed — if a leak appears due to our installation, we set it right at no cost. Product warranties remain with the manufacturer.",
      },
    ],
  },
  {
    slug: "new-bathroom-installation",
    name: "New Bathroom Installation",
    shortName: "New Bathroom",
    tagline: "Complete bathrooms built from scratch — plumbing to finishing",
    metaTitle: "New Bathroom Installation in Chennai - Peepal Flow Fix Solutions",
    metaDescription:
      "Turnkey new bathroom construction in Chennai — plumbing lines, flooring, tiling, electricals and fittings by a team with 25+ years experience. Site visit and clear quote.",
    description: [
      "Adding a new bathroom — whether in a new floor, converting unused space, or for a newly built house — involves plumbing lines, drainage slope, waterproofing, tiling, electricals and fittings working together.",
      "With 25+ years of building bathrooms in Chennai homes, we take care of the entire sequence in the right order, so you don't face problems like standing water, seepage to the floor below, or mismatched tile levels later.",
    ],
    commonProblems: [
      "Improper floor slope causing water pooling",
      "Seepage to the room below within months",
      "Wrongly placed pipe points discovered after tiling",
      "No waterproofing in wet areas",
      "Poor ventilation planning causing dampness",
      "Contractors abandoning work midway",
    ],
    weHandle: [
      "Layout planning and marking of all pipe and electrical points",
      "New soil, waste and fresh water line installation",
      "Floor and wall waterproofing before tiling",
      "Anti-skid flooring and wall tiles with correct slope",
      "Electrical points for geyser, mirror light and exhaust",
      "Complete fittings installation — sanitaryware, taps, showers",
      "Final testing of drainage, leakage and all fittings",
    ],
    process: [
      { title: "Site measurement", detail: "We measure the space and understand your requirements." },
      { title: "Plan and quotation", detail: "A written scope with item-wise pricing and timeline." },
      { title: "Civil and plumbing work", detail: "Lines, slopes and waterproofing completed first." },
      { title: "Tiling and electricals", detail: "Walls, floors and electrical points finished." },
      { title: "Fittings and handover", detail: "Fittings installed, everything tested, site cleaned." },
    ],
    faqs: [
      {
        q: "How much does a new bathroom cost in Chennai?",
        a: "It depends on size, tiles, fittings quality and civil work needed. Basic bathrooms start around ₹60,000–80,000 while premium builds go much higher. A site visit gives you an exact itemised quotation.",
      },
      {
        q: "How many days does it take?",
        a: "Typically 10–18 working days depending on scope, curing time for waterproofing and material availability.",
      },
      {
        q: "Can you build a bathroom on my terrace or stilt floor?",
        a: "Yes, subject to a structural feasibility check. New drainage routing and slab work are part of what we assess during the visit.",
      },
      {
        q: "Do I need to buy materials myself?",
        a: "Your choice. We can supply everything with bills, or work with materials you purchase. Either way, quantities are planned upfront.",
      },
    ],
  },
  {
    slug: "bathroom-renovation",
    name: "Bathroom Renovation",
    shortName: "Renovation",
    tagline: "Old bathrooms transformed — modern, leak-free and easy to maintain",
    metaTitle: "Bathroom Renovation in Chennai | Cost & Services - Peepal Flow Fix",
    metaDescription:
      "Full bathroom renovation in Chennai — demolition, plumbing, waterproofing, tiling and modern fittings. 25+ years experience. Free site visit with itemised quotation.",
    description: [
      "An old bathroom with seepage, broken tiles and outdated fittings drags down your whole home's comfort — and its value.",
      "Renovation means doing things in the right order: removing old work carefully, redoing plumbing where needed, waterproofing properly, then tiling and fittings. Skipping steps is why renovated bathrooms start leaking again within a year. We don't skip steps.",
    ],
    commonProblems: [
      "Persistent seepage and mould that paint cannot hide",
      "Cracked, stained or hollow-sounding old tiles",
      "Leaking concealed pipes behind walls",
      "Outdated fixtures wasting water",
      "Poor lighting and no exhaust arrangement",
      "Previous renovation done with substandard material",
    ],
    weHandle: [
      "Careful removal of old tiles, fittings and damaged plaster",
      "Re-routing or renewing water and drainage lines",
      "Full-area waterproofing with proper curing",
      "Fresh tiling — floor, walls or accent sections",
      "New false ceiling or ceiling treatment where required",
      "Modern fittings, vanity, mirror and storage installation",
      "Final leak test and deep clean before handover",
    ],
    process: [
      { title: "Assessment visit", detail: "We inspect structure, plumbing condition and discuss your design ideas." },
      { title: "Design and quote", detail: "Options at different budgets with an itemised written quotation." },
      { title: "Demolition and prep", detail: "Old work removed safely; surfaces prepared." },
      { title: "Core work", detail: "Plumbing, waterproofing, tiling and electricals executed in sequence." },
      { title: "Finishing", detail: "Fittings, accessories, sealing and a full leak-test handover." },
    ],
    faqs: [
      {
        q: "What is the typical bathroom renovation cost in Chennai?",
        a: "Most mid-range renovations land between ₹75,000 and ₹1.5 lakh depending on size, tile selection and fittings brand. Budget refreshes can be less; premium builds more. Our quotation breaks this down item by item.",
      },
      {
        q: "Can the family use another bathroom during work?",
        a: "Yes, plan for the renovated bathroom being out of use for 1–3 weeks. We sequence work to restore water supply each evening where possible.",
      },
      {
        q: "Will you handle debris removal?",
        a: "Yes, demolition debris removal and daily site cleanup are included in renovation quotations.",
      },
      {
        q: "Can renovation be done phase-wise to manage budget?",
        a: "We can split scope — for example plumbing and waterproofing first, fittings later — but strongly advise completing waterproofing and tiling in one stretch.",
      },
    ],
  },
  {
    slug: "bathroom-alteration",
    name: "Bathroom Alteration",
    shortName: "Alteration",
    tagline: "Change layout, add features or resize your existing bathroom",
    metaTitle: "Bathroom Alteration Services in Chennai - Peepal Flow Fix Solutions",
    metaDescription:
      "Bathroom layout changes in Chennai — shifting toilet/shower positions, adding windows or expanding space. Done safely with correct drainage re-routing. Get a quote.",
    description: [
      "Sometimes a bathroom doesn't need rebuilding — it needs rethinking. Shifting the toilet position, converting a tub into a walk-in shower, combining two small bathrooms, or adding a new window changes how the space works for your family.",
      "Alterations touch drainage lines, ventilation and often structural elements, so they need careful planning. We assess what is feasible, what it costs, and execute it cleanly.",
    ],
    commonProblems: [
      "Toilet or basin positions that make the space cramped",
      "Wanting a shower area instead of an old bathtub",
      "Bathroom door opening awkwardly into furniture",
      "No proper ventilation or exhaust outlet",
      "Need for an additional water point or geyser position",
      "Elderly family members needing safer layouts",
    ],
    weHandle: [
      "Feasibility assessment of layout changes",
      "Shifting of sanitaryware, drains and water lines",
      "Bathtub-to-shower conversions",
      "Door repositioning coordination with carpenters",
      "New exhaust or window opening arrangements",
      "Grab bars and elder-friendly modifications",
      "Making good of disturbed walls, floors and tiles",
    ],
    process: [
      { title: "Discuss the change", detail: "Tell us what isn't working in the current layout." },
      { title: "Feasibility check", detail: "We verify drainage routes, structure and ventilation options." },
      { title: "Proposal", detail: "What can be done, what it costs and how long it takes." },
      { title: "Execution", detail: "Plumbing and civil changes made with minimum disruption." },
      { title: "Restoration", detail: "Tiles, fittings and finishes restored to match your bathroom." },
    ],
    faqs: [
      {
        q: "Can a toilet position really be shifted?",
        a: "Yes, within limits set by drainage slope and slab structure. We confirm feasibility after inspecting the drainage route below or adjacent.",
      },
      {
        q: "How disruptive is an alteration?",
        a: "Most alterations take 5–12 working days. Sections of floor/wall tiles around the changed area will be opened and restored.",
      },
      {
        q: "Is alteration cheaper than full renovation?",
        a: "Usually yes, since only parts of the bathroom are touched. But if tiles are discontinued, matching may require creative solutions — we discuss this upfront.",
      },
    ],
  },
  {
    slug: "water-leakage-repair",
    name: "Water Leakage Repair",
    shortName: "Leak Repair",
    tagline: "Find hidden leaks and stop seepage permanently",
    metaTitle: "Water Leakage Repair in Chennai | Seepage Experts - Peepal Flow Fix",
    metaDescription:
      "Hidden leak detection and permanent seepage repair for Chennai homes — walls, ceilings, bathrooms and terraces. Experienced diagnosis, not temporary patches. Call now.",
    description: [
      "That yellow patch on the ceiling or damp corner near the bathroom is a symptom. Treating the symptom with paint or putty brings the problem back with the next monsoon.",
      "Chennai's climate — humid summers, heavy monsoons, coastal air in OMR belt — is hard on buildings. We trace leakage to its actual source using experience and systematic elimination, then repair it with appropriate methods, whether it's a failed pipe joint, cracked tile grout or missing waterproofing.",
    ],
    commonProblems: [
      "Damp patches growing on bedroom/living room ceilings",
      "Wall paint bubbling near bathrooms",
      "Water dripping from ceiling during upstairs bathroom use",
      "Terrace leakage during monsoon",
      "Rising dampness on ground floor walls",
      "Unexplained increase in water bill suggesting hidden pipe leak",
      "Grout lines darkening with mould",
    ],
    weHandle: [
      "Systematic leak source identification — not guesswork",
      "Concealed pipeline leak location and pipe replacement",
      "Bathroom floor and sunken slab waterproofing repairs",
      "Tile grout re-sealing and epoxy grouting",
      "Terrace and balcony leakage treatment",
      "Ceiling restoration coordination after leak fixing",
      "Pressure testing to confirm the leak is truly fixed",
    ],
    process: [
      { title: "Describe the signs", detail: "Where you see dampness, when it worsens, how long it's been there." },
      { title: "Source investigation", detail: "We inspect likely sources systematically until confirmed." },
      { title: "Repair plan", detail: "The right method for the actual cause, priced clearly." },
      { title: "Fix and proof", detail: "Repair executed and verified — often with water testing." },
      { title: "Follow-up", detail: "We check back after the first rain or heavy use where relevant." },
    ],
    faqs: [
      {
        q: "Why does the leak come back after every repair?",
        a: "Because most quick fixes treat the visible dampness, not the source. Until the actual entry point — often metres away from the stain — is sealed, leakage returns. Proper source-finding is the core of our approach.",
      },
      {
        q: "How do you find leaks inside walls?",
        a: "Through systematic elimination: checking pipe routing plans, moisture patterns, pressure testing sections and years of experience reading how buildings behave.",
      },
      {
        q: "Does waterproofing need breaking the whole bathroom?",
        a: "Not always. Some cases are solved via grouting and targeted injection; others genuinely need reopening the floor. The assessment tells us honestly which applies.",
      },
      {
        q: "When is the best time to fix leakage in Chennai?",
        a: "Ideally in dry months so materials cure well. But active leaks can't wait — we stabilise first and schedule permanent treatment appropriately.",
      },
    ],
  },
  {
    slug: "home-maintenance",
    name: "General Home Maintenance",
    shortName: "Maintenance",
    tagline: "One reliable team for all your home's small and big fixes",
    metaTitle: "Home Maintenance Services in Chennai - Peepal Flow Fix Solutions",
    metaDescription:
      "Annual and on-demand home maintenance in Chennai — plumbing, electrical, carpentry touches and preventive checks by one trusted team. Packages for homes and apartments.",
    description: [
      "Homes need ongoing attention: the tap that started dripping, the fan capacitor that died, the door hinge that squeaks, the drain that slows every few months.",
      "Instead of chasing a different vendor for each problem, our maintenance service gives you one dependable contact for everything — backed by 25+ years of knowing how houses actually behave. Ideal for busy families, landlords and apartment owners.",
    ],
    commonProblems: [
      "Small pending fixes piling up for months",
      "Unreliable one-time vendors who don't return",
      "No idea about the real condition of plumbing/electricals",
      "Tenant complaints handled slowly and poorly",
      "Repeated expenses from unaddressed root causes",
      "Pre-monsoon preparation never happening on time",
    ],
    weHandle: [
      "Comprehensive home inspection visits with a checklist report",
      "Plumbing, electrical and minor civil fixes in one visit",
      "Preventive maintenance — drains, flush tanks, motors, earthing",
      "Pre-monsoon checks: terrace drains, sealants, sump cleanliness",
      "Move-in / move-out repair packages for owners and tenants",
      "Periodic maintenance schedules for individual homes",
      "Priority response for maintenance customers",
    ],
    process: [
      { title: "Book a visit", detail: "List your pending items — we allocate enough time." },
      { title: "Checklist walkthrough", detail: "We review agreed items plus flag anything noticed." },
      { title: "Fix on the spot", detail: "Most maintenance items are completed in the same visit." },
      { title: "Report and advice", detail: "Clear summary of work done and what to watch for." },
      { title: "Scheduled follow-ups", detail: "Optional periodic visits so problems never pile up." },
    ],
    faqs: [
      {
        q: "What does a maintenance visit cost?",
        a: "Visits are priced based on the list of items and expected duration — shared upfront. Materials are charged separately at transparent rates.",
      },
      {
        q: "Do you offer annual maintenance contracts?",
        a: "Yes, for individual houses and apartments we can set scheduled quarterly or half-yearly visits with priority response. Talk to us for a customised plan.",
      },
      {
        q: "Can you handle rental property maintenance for owners outside India?",
        a: "Yes. Many NRI landlords rely on us as their local point of contact, with photo reports after each visit and WhatsApp updates.",
      },
    ],
  },
];

export function getServiceContent(slug: string): ServiceContent | undefined {
  return SERVICES_CONTENT.find((s) => s.slug === slug);
}
