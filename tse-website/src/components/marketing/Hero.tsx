import { Suspense, lazy, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { CanvasErrorBoundary } from "./CanvasErrorBoundary";
import { GlowOrbs } from "./GlowOrbs";
import { Magnetic } from "./Magnetic";

const Hero3D = lazy(() => import("./Hero3D").then((mod) => ({ default: mod.Hero3D })));

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

function HeroFallback() {
  return <div className="h-full w-full rounded-3xl bg-gradient-to-br from-forest via-forest to-coral" />;
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity: heroOpacity }}
      className="relative overflow-hidden bg-forest bg-dot-grid-dark text-paper"
    >
      <GlowOrbs />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <motion.div style={{ y: textY }} initial="hidden" animate="show" variants={container}>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full bg-paper/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-lime"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Social Media Growth · Websites · Digital Growth
          </motion.span>
          <motion.h1
            variants={item}
            className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Turn attention into your{" "}
            <span className="bg-gradient-to-r from-lime to-coral bg-clip-text text-transparent">
              customer base
            </span>
            .
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-lg text-lg text-paper/75">
            We build the social presence, websites and content that businesses use to turn
            attention into customers — no bloated retainers, no generic playbooks.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-4">
            <Magnetic>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-semibold text-paper transition-transform hover:-translate-y-0.5"
              >
                Get a free consult
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-7 py-3.5 font-semibold text-paper transition-colors hover:border-paper"
            >
              See our work
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: canvasY }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="h-72 sm:h-96 md:h-[26rem]"
        >
          <CanvasErrorBoundary fallback={<HeroFallback />}>
            <Suspense fallback={<HeroFallback />}>
              <Hero3D />
            </Suspense>
          </CanvasErrorBoundary>
        </motion.div>
      </div>
    </motion.section>
  );
}
