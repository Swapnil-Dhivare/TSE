import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

export interface Scene { label: string; title: string; body: string }

/**
 * Pinned scroll sequence: the section sticks to the viewport while the page
 * scrolls, and the content swaps step by step. This is the "different content
 * comes in as you scroll" effect.
 *
 * Trap: sticky breaks if ANY ancestor has a transform/filter/will-change, so this
 * must not be wrapped in a Reveal.
 */
export function StickyScene({ scenes, eyebrow }: { scenes: Scene[]; eyebrow?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.6 });

  // Reduced motion: no pinning, just stack the scenes as static blocks.
  if (reduced) {
    return (
      <section className="mx-auto max-w-5xl space-y-12 px-6 py-20">
        {scenes.map((s) => (
          <div key={s.title}>
            <div className="font-mono text-xs uppercase tracking-widest text-brand-lift">{s.label}</div>
            <h3 className="mt-3 font-display text-3xl font-bold uppercase text-ink">{s.title}</h3>
            <p className="mt-3 max-w-xl text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <div ref={ref} style={{ height: `${scenes.length * 90}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            {eyebrow && (
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand-lift">{eyebrow}</div>
            )}
            <div className="mt-4 flex gap-2">
              {scenes.map((_, i) => (
                <Bar key={i} index={i} count={scenes.length} progress={progress} />
              ))}
            </div>
          </div>

          <div className="relative min-h-[320px]">
            {scenes.map((scene, i) => (
              <SceneBlock key={scene.title} scene={scene} index={i} count={scenes.length} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ index, count, progress }: {
  index: number; count: number; progress: ReturnType<typeof useSpring>;
}) {
  const start = index / count;
  const end = (index + 1) / count;
  const scaleX = useTransform(progress, [start, end], [0, 1], { clamp: true });
  return (
    <div className="h-1 w-12 overflow-hidden rounded-full bg-line">
      <motion.div style={{ scaleX }} className="h-full origin-left rounded-full bg-brand" />
    </div>
  );
}

function SceneBlock({ scene, index, count, progress }: {
  scene: Scene; index: number; count: number; progress: ReturnType<typeof useSpring>;
}) {
  const unit = 1 / count;
  const start = index * unit;
  // Cross-fade with a slight vertical travel, overlapping at the boundaries.
  // Tight windows: the outgoing scene must finish fading before the next arrives,
  // otherwise two headlines ghost over each other.
  const inAt = start - unit * 0.08;
  const held = start + unit * 0.14;
  const holdEnd = start + unit * 0.80;
  const outAt = start + unit * 0.94;
  const opacity = useTransform(progress, [inAt, held, holdEnd, outAt], [0, 1, 1, 0]);
  const y = useTransform(progress, [inAt, held, holdEnd, outAt], [36, 0, 0, -36]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0">
      <div className="font-mono text-xs uppercase tracking-widest text-heat">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")} · {scene.label}
      </div>
      <h3 className="mt-4 font-display text-4xl font-bold uppercase leading-[0.95] text-ink sm:text-6xl">
        {scene.title}
      </h3>
      <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{scene.body}</p>
    </motion.div>
  );
}
