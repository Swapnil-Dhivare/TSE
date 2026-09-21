import { Megaphone, MonitorSmartphone, PenTool } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SERVICE_CATEGORIES = ["Social Media", "Website", "Content Creation"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface Service {
  slug: string;
  name: ServiceCategory;
  tagline: string;
  description: string;
  features: string[];
  icon: LucideIcon;
}

export const SERVICES: Service[] = [
  {
    slug: "social-media",
    name: "Social Media",
    tagline: "Growth you can measure, not just impressions.",
    description:
      "Data-backed social media growth — consistent content, real community management and smart amplification working together to turn followers into paying customers, not vanity metrics.",
    features: [
      "Growth-focused content calendar, not just a posting schedule",
      "Reels, posts and stories built to be shared, not scrolled past",
      "Community management that turns comments into customers",
      "Monthly growth report in plain English — no jargon",
    ],
    icon: Megaphone,
  },
  {
    slug: "website",
    name: "Website",
    tagline: "A website built to grow your business, not just look good.",
    description:
      "Custom-built, mobile-first websites engineered for one thing: growth. Fast to load, easy to update, and built with search visibility in mind from day one — every page designed to turn visitors into enquiries.",
    features: [
      "Custom design built around how you actually get customers",
      "Mobile-first, fast-loading pages that keep visitors around",
      "Built-in SEO fundamentals for long-term organic growth",
      "Clear calls-to-action, not decoration",
    ],
    icon: MonitorSmartphone,
  },
  {
    slug: "content-creation",
    name: "Content Creation",
    tagline: "The content engine behind every growth channel.",
    description:
      "On-site and studio content production — photography, short-form video and copywriting — built to fuel your social growth and your website with content that actually looks and sounds like you.",
    features: [
      "On-location photo and video shoots",
      "Short-form video edited to drive social growth",
      "Copywriting for your site, ads and captions",
      "A reusable content library that fuels growth long after the shoot",
    ],
    icon: PenTool,
  },
];
