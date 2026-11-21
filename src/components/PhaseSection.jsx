import { motion } from "framer-motion";
import TopicCard from "./TopicCard.jsx";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function PhaseSection({ phase, isDone, onToggle, onOpen, totalDone }) {
  return (
    <section id={phase.id} className="scroll-mt-28">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div
          variants={item}
          className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex gap-4 sm:gap-5">
            <div className="flex flex-col items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] font-mono text-sm text-mint-300">
                {phase.number}
              </span>
              <span
                className="mt-2 h-full w-px bg-gradient-to-b from-white/15 to-transparent"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {phase.tagline}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-[26px]">
                {phase.title}
              </h3>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-400">
                {phase.summary}
              </p>
            </div>
          </div>

          <div className="ml-15 shrink-0 sm:ml-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-slate-400">
              <span
                className={
                  totalDone === phase.topics.length ? "text-mint-400" : "text-slate-500"
                }
              >
                {totalDone}
              </span>
              /{phase.topics.length} complete
            </span>
          </div>
        </motion.div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {phase.topics.map((topic) => (
            <motion.div key={topic.id} variants={item} className="flex">
              <TopicCard
                topic={topic}
                done={isDone(topic.id)}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
