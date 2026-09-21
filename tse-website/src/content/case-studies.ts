import type { ServiceCategory } from "./services";

export interface CaseStudy {
  slug: string;
  title: string;
  clientName: string;
  serviceCategory: ServiceCategory;
  shortDescription: string;
  results: string;
  gradient: string;
}

// Placeholder case studies — swap for real client work once available.
export const CASE_STUDIES: CaseStudy[] = [
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
