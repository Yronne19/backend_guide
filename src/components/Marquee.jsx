import { stackChips } from "../data/roadmap.js";

export default function Marquee() {
  const items = [...stackChips, ...stackChips];

  return (
    <section className="marquee mt-16 overflow-hidden border-y border-white/[0.07] bg-white/[0.015] py-3.5 sm:mt-20">
      <div className="flex w-max marquee-track items-center">
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center whitespace-nowrap px-5">
            <span className="mr-5 h-1 w-1 rounded-full bg-mint-400/60" aria-hidden="true" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
              {item}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
