const ITEMS = ["Social Media Growth", "Website Design", "Digital Growth", "Content Creation"];

export function Marquee() {
  return (
    <div className="group overflow-hidden bg-forest py-5">
      <div className="flex w-max animate-marquee gap-12 group-hover:[animation-play-state:paused]">
        {[...ITEMS, ...ITEMS].map((item, index) => (
          <span
            key={index}
            className="flex shrink-0 items-center gap-12 whitespace-nowrap font-display text-lg font-semibold text-paper/70 sm:text-2xl"
          >
            {item}
            <span className="text-lime">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
