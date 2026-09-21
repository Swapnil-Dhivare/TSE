import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/content/testimonials";

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const testimonial = TESTIMONIALS[index];

  function go(delta: number) {
    setIndex((current) => (current + delta + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-line bg-card p-10 text-center shadow-sm shadow-ink/5">
      <Quote className="mx-auto h-8 w-8 text-lime" />
      <AnimatePresence mode="wait">
        <motion.div
          key={testimonial.author}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <p className="mt-5 text-lg leading-relaxed text-ink">"{testimonial.quote}"</p>
          <div className="mt-6 text-sm font-semibold text-forest">{testimonial.author}</div>
          <div className="text-xs text-muted-foreground">{testimonial.business}</div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-forest hover:text-forest"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((item, itemIndex) => (
            <button
              key={item.author}
              type="button"
              aria-label={`Go to testimonial ${itemIndex + 1}`}
              onClick={() => setIndex(itemIndex)}
              className={`h-1.5 rounded-full transition-all ${
                itemIndex === index ? "w-6 bg-forest" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-forest hover:text-forest"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
