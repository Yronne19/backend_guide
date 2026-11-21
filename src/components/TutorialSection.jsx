import { motion } from "framer-motion";
import { ArrowRight, Check, CodeIcon } from "./Icons.jsx";
import { chapters, tutorialMeta } from "../data/tutorial.js";

export default function TutorialSection({ onOpen }) {
  return (
    <section id="tutorial" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Guided build · Spring Boot
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Build it once, from empty folder to deployed API.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {chapters.length} chapters, one real project:{" "}
            <span className="text-slate-200">{tutorialMeta.project}</span>. Every
            chapter has the code, the reason it exists, the mistakes beginners make,
            and a checkpoint you can run before moving on. No other tab needed.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint-300">
              Before you start
            </p>
            <ul className="mt-3 space-y-2">
              {tutorialMeta.prerequisites.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-400"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-400/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-mint-400/20 bg-mint-400/[0.04] p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint-300">
              What you end up with
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
              {tutorialMeta.outcome}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-mint-400/15 pt-4 font-mono text-[10px] text-slate-500">
              <span className="rounded border border-white/10 px-2 py-0.5">
                {chapters.length} chapters
              </span>
              <span className="rounded border border-white/10 px-2 py-0.5">
                {tutorialMeta.totalTime}
              </span>
              <span className="rounded border border-white/10 px-2 py-0.5">
                Java 21 · Boot 3
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {chapters.map((chapter, index) => (
            <motion.button
              key={chapter.id}
              type="button"
              onClick={() => onOpen(chapter.id)}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(index, 5) * 0.04 }}
              className="group flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-mint-400/35 hover:bg-mint-400/[0.04] sm:p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-ink-950 font-mono text-[11px] text-mint-300">
                {chapter.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[14.5px] font-semibold text-white">
                  {chapter.title}
                </span>
                <span className="mt-1 block text-[12.5px] leading-relaxed text-slate-500">
                  {chapter.tagline}
                </span>
                <span className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] text-mint-300/80">
                  <CodeIcon className="h-3 w-3" />
                  {chapter.code ? "Code + checkpoint" : "Checklist"}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  <span className="ml-auto shrink-0 whitespace-nowrap pl-2 text-[9.5px] text-slate-600">
                    {chapter.time}
                  </span>
                </span>
              </span>
            </motion.button>
          ))}
        </div>

        <p className="mt-6 font-mono text-[11px] leading-relaxed text-slate-600">
          The tutorial builds the first project in the build track below. Finish it,
          then repeat the same loop on the next project without a guide.
        </p>
      </div>
    </section>
  );
}
