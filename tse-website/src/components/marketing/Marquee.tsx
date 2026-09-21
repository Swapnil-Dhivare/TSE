const ITEMS = ["Social Media Growth", "Website Design", "Digital Growth", "Content Creation", "Events"];

function Row({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="flex w-max gap-10" style={{ animation: `marquee 28s linear infinite${reverse ? " reverse" : ""}` }}>
      {[...ITEMS, ...ITEMS].map((item, i) => (
        <span key={i} className="flex shrink-0 items-center gap-10 whitespace-nowrap font-display text-2xl font-bold uppercase tracking-wide text-paper sm:text-4xl">
          {item}
          <span className="text-heat">✦</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="group space-y-2 overflow-hidden border-y border-line bg-brand py-5">
      <Row />
      <div className="opacity-60"><Row reverse /></div>
    </div>
  );
}
