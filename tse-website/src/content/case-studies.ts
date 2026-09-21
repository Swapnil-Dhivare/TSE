import type { ServiceCategory } from "./services";

export interface CaseStudyImage {
  src: string;
  alt: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  clientName: string;
  serviceCategory: ServiceCategory;
  shortDescription: string;
  results: string;
  gradient: string;
  /** Hero/thumbnail screenshot. Falls back to the gradient placeholder when omitted. */
  image?: CaseStudyImage;
  /** Extra screenshots shown on the case study detail page. */
  gallery?: CaseStudyImage[];
  challenge?: string;
  approach?: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "technoserve-engineers-website",
    title: "Giving a 20-year-old engineering firm its first real digital presence",
    clientName: "Technoserve Engineers",
    serviceCategory: "Website",
    shortDescription:
      "Technoserve Engineers had built two decades of credibility with sugar mills, steel plants and cement majors entirely through word of mouth. We built them a website that finally represents that track record online.",
    results: "Full service & client catalogue now live · every enquiry now one tap away on mobile",
    gradient: "from-forest via-forest to-lime",
    image: {
      src: "/case-studies/technoserve-engineers/home-desktop.jpg",
      alt: "Technoserve Engineers homepage showing their electrical motor and switchgear product range",
    },
    gallery: [
      {
        src: "/case-studies/technoserve-engineers/services-desktop.jpg",
        alt: "Technoserve Engineers services page listing motor rewinding, repairing and switchgear services",
      },
      {
        src: "/case-studies/technoserve-engineers/clients-desktop.jpg",
        alt: "Technoserve Engineers client roster page listing sugar, steel, paper and cement plant clients",
      },
      {
        src: "/case-studies/technoserve-engineers/home-mobile.jpg",
        alt: "Technoserve Engineers homepage on a mobile device",
      },
    ],
    challenge:
      "Established in 2003 and based in Dombivli, Maharashtra, Technoserve Engineers builds and services electrical panels, switchgear, VFDs and rotating machines for a client list that includes sugar mills, steel and rolling mills, paper plants and cement majors like JSW Steel, Grasim and Ambuja Cement. Despite that roster, the business had no proper website — just a phone number passed along by referral. Anyone searching for them online found nothing that reflected the scale or seriousness of the work.",
    approach:
      "We built a straightforward, fast-loading site around what actually wins this kind of B2B enquiry: a clear breakdown of every service (from HT motor rewinding to switchgear sales), an About page that puts their 20+ years of engineering experience front and centre, and a full client directory organised by industry so prospects can see who else trusts them. Contact details — phone and email — are one tap away from every page, on desktop and mobile, so a plant engineer searching from the shop floor can reach them immediately.",
  },
  {
    slug: "green-leaf-cafe-social",
    title: "Turning a neighbourhood café into a weekend destination",
    clientName: "Green Leaf Café",
    serviceCategory: "Social Media",
    shortDescription:
      "A consistent posting rhythm and a reel-first content strategy took a quiet café from word-of-mouth only to a genuine weekend queue.",
    results: "+64% Instagram engagement · 3x weekend footfall in 90 days",
    gradient: "from-forest via-forest to-coral",
  },
  {
    slug: "vantage-legal-website",
    title: "A website that finally matches the quality of the practice",
    clientName: "Vantage Legal Associates",
    serviceCategory: "Website",
    shortDescription:
      "Replaced a decade-old static site with a fast, mobile-first build focused on getting the right enquiries to the right lawyer.",
    results: "+2.4x qualified enquiry form submissions · 1.8s average load time",
    gradient: "from-forest via-coral to-lime",
  },
  {
    slug: "fitworks-studio-content",
    title: "Building a content library that outlasts every campaign",
    clientName: "FitWorks Studio",
    serviceCategory: "Content Creation",
    shortDescription:
      "A single day of on-location photo and video production gave this studio a year's worth of reusable content across web, social and print.",
    results: "180+ reusable assets delivered · content used across 4 channels",
    gradient: "from-coral via-forest to-forest",
  },
];
