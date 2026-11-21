import { motion } from "framer-motion";
import { ArrowRight, CodeIcon, Sparkle } from "./Icons.jsx";
import { meta, phases, totalTopics } from "../data/roadmap.js";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
};

const responseLines = [
  { text: "HTTP/1.1 200 OK", tone: "text-mint-300" },
  { text: "content-type: application/json", tone: "text-slate-400" },
  { text: "x-trace-id: 4bf9c1a2e8d7", tone: "text-slate-500" },
  { text: "", tone: "" },
  { text: "{", tone: "text-slate-400" },
  { text: '  "id": "ord_7f3a",', tone: "text-slate-200" },
  { text: '  "status": "PAID",', tone: "text-iris-400" },
  { text: '  "total": 149.90,', tone: "text-mint-300" },
  { text: '  "items": 3', tone: "text-slate-200" },
  { text: "}", tone: "text-slate-400" },
];

export default function Hero({ doneCount, exampleCount }) {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-mint-500/12 blur-[110px] sm:h-[46rem] sm:w-[46rem]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 -z-10 h-80 w-80 rounded-full bg-iris-600/20 blur-[100px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
          <div>
            <motion.div variants={fade} initial="hidden" animate="show" custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/25 bg-mint-400/[0.07] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mint-300 sm:text-[11px]">
                <Sparkle className="h-3.5 w-3.5" />
                Personal field guide · {meta.edition}
              </span>
            </motion.div>

            <motion.h1
              variants={fade}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.15rem]"
            >
              Backend engineering,
              <br />
              <span className="bg-gradient-to-r from-mint-300 via-mint-400 to-iris-400 bg-clip-text text-transparent">
                mapped end to end.
              </span>
            </motion.h1>

            <motion.p
              variants={fade}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-base"
            >
              From the first HTTP request to production observability — a personal
              roadmap of the skills that matter, each stop paired with a
              real-world <span className="text-slate-200">Java + Spring Boot</span>{" "}
              example you can actually ship.
            </motion.p>

            <motion.div
              variants={fade}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <a
                href="#roadmap"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-mint-400 px-5 py-3 text-sm font-semibold text-ink-950 shadow-[0_0_40px_-12px_rgba(79,224,174,0.8)] transition hover:bg-mint-300"
              >
                Start the roadmap
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#apis"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <CodeIcon className="h-4 w-4 text-mint-400" />
                Jump to Spring Boot code
              </a>
            </motion.div>

            <motion.dl
              variants={fade}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-10 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06]"
            >
              {[
                { value: String(phases.length), label: "phases" },
                { value: String(totalTopics), label: "topics" },
                { value: String(exampleCount), label: "code examples" },
              ].map((stat) => (
                <div key={stat.label} className="bg-ink-900/90 px-4 py-3.5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </motion.dl>

            <motion.p
              variants={fade}
              initial="hidden"
              animate="show"
              custom={5}
              className="mt-4 font-mono text-[11px] text-slate-500"
            >
              {doneCount} of {totalTopics} complete · progress saved on this device
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-mint-500/15 via-transparent to-iris-500/15 blur-2xl" aria-hidden="true" />

            <div className="glass overflow-hidden rounded-2xl shadow-[0_32px_80px_-32px_rgba(0,0,0,0.9)]">
              <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                <p className="ml-2 truncate font-mono text-[11px] text-slate-400">
                  ~/shop-api — zsh
                </p>
                <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                  live
                </span>
              </div>

              <div className="px-4 py-5 font-mono text-[11.5px] leading-[1.9] sm:px-5 sm:text-xs">
                <p className="text-slate-500">
                  <span className="text-mint-400">➜</span>{" "}
                  <span className="text-iris-400">~/shop-api</span> curl -s \
                </p>
                <p className="text-slate-300">
                  {"  "}localhost:8080/api/v1/orders/ord_7f3a
                </p>
                <p className="mt-4 text-slate-500 terminal-caret" />

                <div className="mt-2 space-y-0.5">
                  {responseLines.map((line, i) => (
                    <motion.p
                      key={`${line.text}-${i}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.75 + i * 0.055, duration: 0.3 }}
                      className={line.tone}
                    >
                      {line.text || "\u00A0"}
                    </motion.p>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] bg-white/[0.015] px-4 py-3">
                {["Spring Boot 3.4", "PostgreSQL", "Redis", "JWT"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-slate-400"
                  >
                    {chip}
                  </span>
                ))}
                <span className="ml-auto font-mono text-[10px] text-mint-400">200 OK · 38 ms</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.5 }}
              className="absolute -left-3 top-24 hidden items-center gap-2 rounded-lg border border-white/10 bg-ink-800/90 px-3 py-2 shadow-xl backdrop-blur sm:flex"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mint-400/15 font-mono text-[10px] text-mint-300">
                {"{}"}
              </span>
              <span className="font-mono text-[10px] text-slate-300">
                @RestController
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="absolute -bottom-5 right-2 hidden items-center gap-2 rounded-lg border border-white/10 bg-ink-800/90 px-3 py-2 shadow-xl backdrop-blur sm:flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-mint-400 pulse-dot" />
              <span className="font-mono text-[10px] text-slate-300">
                p95 latency · 42 ms
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
