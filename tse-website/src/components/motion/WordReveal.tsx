import { motion } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

/**
 * Per-word rise. Split on words, never characters — character splitting breaks
 * screen readers and text selection. The full string stays available to AT via
 * a visually-hidden copy.
 */
export function WordReveal({
  text, className, delay = 0,
}: { text: string; className?: string; delay?: number }) {
  const { reduced } = useMotionPrefs();
  const words = text.split(" ");

  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
        className="inline"
      >
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                show: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </span>
  );
}
