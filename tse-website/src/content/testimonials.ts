export interface Testimonial {
  quote: string;
  author: string;
  business: string;
}

// Placeholder testimonials — swap for real client quotes once available.
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "They actually understood our customers instead of pushing a generic playbook. Our booking calendar has looked completely different since.",
    author: "Meera Iyer",
    business: "Owner, Green Leaf Café",
  },
  {
    quote:
      "The new site finally feels like us. More importantly, it's the first time our enquiries have matched the quality of work we actually do.",
    author: "Arvind Rao",
    business: "Partner, Vantage Legal Associates",
  },
  {
    quote:
      "One shoot day gave us a year of content. That alone paid for itself within the first month.",
    author: "Priya Sundaram",
    business: "Founder, FitWorks Studio",
  },
];
