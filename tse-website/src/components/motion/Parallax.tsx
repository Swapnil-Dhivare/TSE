import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

/** Scroll-scrubbed vertical drift. Keep `strength` small (20–60px) or it reads as broken. */
export function Parallax({
  children, className, strength = 40,
}: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  if (reduced) return <div className={className}>{children}</div>;
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>;
}
