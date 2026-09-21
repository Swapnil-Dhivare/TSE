import { Suspense, lazy, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { Magnetic } from "./Magnetic";
import { WordReveal } from "@/components/motion/WordReveal";
import { useMotionPrefs } from "@/components/motion/useMotionPrefs";

const Hero3D = lazy(() => import("./Hero3D").then((m) => ({ default: m.Hero3D })));

function HeroFallback() {
  return <div className="h-full w-full rounded-3xl bg-gradient-to-br from-brand/40 to-heat/30" />;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const propY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -70]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduced ? 1 : 0]);

  return (
    <motion.section ref={ref} style={{ opacity: fade }} className="relative overflow-hidden">
      {/* floating 3D prop, bleeding off the right edge */}
      {/* Floating prop, kept clear of the headline and backed by a glow so it
          reads against the near-black canvas. */}
      <motion.div
        style={{ y: propY }}
        className="pointer-events-none absolute -right-20 bottom-[-6rem] hidden h-[26rem] w-[26rem] lg:block"
      >
        <div className="absolute inset-8 rounded-full bg-brand/30 blur-[90px]" />
        <div className="relative h-full w-full">
          <CanvasErrorBoundary fallback={<HeroFallback />}>
            <Suspense fallback={<HeroFallback />}><Hero3D /></Suspense>
          </CanvasErrorBoundary>
        </div>
      </motion.div>

      <motion.div style={{ y: titleY }} className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
        <motion.span
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-lift"
        >
          Social growth · Websites · Events
        </motion.span>

        {/* Oversized compressed display type — the single loudest element on the page. */}
        <h1 className="mt-6 font-display text-[clamp(3.5rem,13vw,11rem)] font-extrabold uppercase leading-[0.82] tracking-tight text-ink">
          <WordReveal text="Turn attention" />
          <span className="block text-muted-foreground">
            <WordReveal text="into customers" delay={0.25} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground"
        >
          We build the social presence, websites and events that businesses use to
          turn attention into customers — no bloated retainers, no generic playbooks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Magnetic>
            <Link to="/events"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-paper transition-transform hover:-translate-y-0.5">
              See what's on
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
          <Link to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-colors hover:border-brand/60">
            Work with us
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
