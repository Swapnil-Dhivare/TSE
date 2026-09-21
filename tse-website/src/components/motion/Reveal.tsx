import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionPrefs } from "./useMotionPrefs";

type Direction = "up" | "down" | "left" | "right" | "scale" | "blur";

const OFFSET: Record<Direction, { x?: number; y?: number; scale?: number; filter?: string }> = {
  up:    { y: 34 },
  down:  { y: -34 },
  left:  { x: 40 },
  right: { x: -40 },
  scale: { scale: 0.94 },
  blur:  { y: 20, filter: "blur(10px)" },
};

/**
 * Scroll reveal with direction variety. Replaces the single fade-up that was used
 * on every section — alternating direction is most of what makes a page feel alive.
 */
export function Reveal({
  children, className, direction = "up", delay = 0, amount = 0.2,
}: {
  children: ReactNode; className?: string; direction?: Direction;
  delay?: number; amount?: number;
}) {
  const { reduced } = useMotionPrefs();
  const from = OFFSET[direction];

  const variants: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.25 } } }
    : {
        hidden: { opacity: 0, ...from },
        show: {
          opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)",
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
        },
      };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

/** Parent that staggers its <RevealItem> children. */
export function RevealGroup({
  children, className, stagger = 0.08, amount = 0.15,
}: { children: ReactNode; className?: string; stagger?: number; amount?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children, className, direction = "up",
}: { children: ReactNode; className?: string; direction?: Direction }) {
  const { reduced } = useMotionPrefs();
  const from = OFFSET[direction];
  const variants: Variants = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.25 } } }
    : {
        hidden: { opacity: 0, ...from },
        show: {
          opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)",
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      };
  return <motion.div className={className} variants={variants}>{children}</motion.div>;
}
