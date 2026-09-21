import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMotionPrefs } from "./useMotionPrefs";

/**
 * Route-level transition. Keyed on pathname (not location.key) so changing a
 * search param — e.g. a filter — doesn't retrigger the whole page animation.
 */
export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const { reduced } = useMotionPrefs();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: reduced ? 0.15 : 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
