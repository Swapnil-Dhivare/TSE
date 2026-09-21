import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

// Animates the numeric prefix of a value like "100%" or "3" on scroll into view,
// writing directly to the DOM via the spring's change listener to avoid per-frame re-renders.
export function AnimatedCounter({ value }: { value: string }) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const digitsRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(wrapperRef, { once: true, margin: "-10% 0px" });

  const match = value.match(/^(\d+)(.*)$/);
  const numericPart = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 55, damping: 18 });

  useEffect(() => {
    if (isInView && numericPart !== null) motionValue.set(numericPart);
  }, [isInView, numericPart, motionValue]);

  useEffect(() => {
    if (numericPart === null) return;
    return spring.on("change", (latest) => {
      if (digitsRef.current) digitsRef.current.textContent = Math.round(latest).toString();
    });
  }, [spring, numericPart]);

  if (numericPart === null) {
    return <span ref={wrapperRef}>{value}</span>;
  }

  return (
    <span ref={wrapperRef}>
      <span ref={digitsRef}>0</span>
      {suffix}
    </span>
  );
}
