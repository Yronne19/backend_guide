import { ArrowUpRight, Layers } from "./Icons.jsx";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.07]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-mint-400/30 bg-mint-400/10 font-mono text-sm text-mint-300">
                {"{}"}
              </span>
              <span className="font-display text-sm font-semibold text-white">
                backend<span className="text-mint-400">.</span>roadmap
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              A personal study companion, not a course. Follow the phases in order,
              tick off what you can explain out loud, and keep building small
              projects that exercise each idea.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-14">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Reference
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href="https://roadmap.sh/backend"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-mint-300"
                  >
                    roadmap.sh/backend
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://spring.io/guides"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-mint-300"
                  >
                    Spring guides
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.spring.io/spring-boot/index.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-mint-300"
                  >
                    Spring Boot docs
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Tracks
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                  Java · Spring Boot
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full border border-slate-600" />
                  Python · FastAPI
                  <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    next
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
            <Layers className="h-3.5 w-3.5" />
            Built as a personal reference · 2026
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            Structure follows roadmap.sh · examples written for this guide
          </p>
        </div>
      </div>
    </footer>
  );
}
