import { useEffect, useState } from "react";

/**
 * Live reduced-motion listener. The old implementations read the media query once
 * at mount and never updated, so toggling the OS setting did nothing until reload.
 */
export function useMotionPrefs() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return { reduced };
}
