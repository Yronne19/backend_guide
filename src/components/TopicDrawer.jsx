import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Close } from "./Icons.jsx";
import CodeBlock from "./CodeBlock.jsx";

function SectionLabel({ children }) {
  return (
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
      {children}
    </p>
  );
}

export default function TopicDrawer({ topic, done, onClose, onToggle, onNavigate }) {
  const closeRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!topic) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    scrollRef.current?.scrollTo({ top: 0 });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [topic, onClose]);

  return (
    <AnimatePresence>
      {topic && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[79] bg-ink-950/75 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {topic && (
        <motion.aside
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="topic-drawer-title"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-2xl flex-col border-l border-white/[0.1] bg-ink-900 shadow-[0_0_80px_rgba(0,0,0,0.7)] lg:max-w-3xl"
        >
          <header className="flex items-start gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-7 sm:py-5">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mint-300">
                Phase {topic.phaseNumber} · {topic.phaseTitle}
              </p>
              <h2
                id="topic-drawer-title"
                className="mt-2 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl"
              >
                {topic.title}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-white/25 hover:text-white"
              aria-label="Close topic"
            >
              <Close className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            <p className="text-sm leading-relaxed text-slate-300">{topic.blurb}</p>

            {topic.overview && (
              <div className="mt-5 border-l-2 border-mint-400/40 pl-4">
                <p className="text-[13.5px] leading-relaxed text-slate-300">
                  {topic.overview}
                </p>
              </div>
            )}

            <div className="mt-7">
              <SectionLabel>What to remember</SectionLabel>
              <ul className="space-y-3">
                {topic.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-[13px] leading-relaxed text-slate-400"
                  >
                    <span
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-mint-400/70"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {topic.terms?.length > 0 && (
              <div className="mt-7">
                <SectionLabel>Key terms</SectionLabel>
                <dl className="grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
                  {topic.terms.map(([term, definition]) => (
                    <div key={term} className="bg-ink-900 p-4">
                      <dt className="font-mono text-[11.5px] text-mint-300">{term}</dt>
                      <dd className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">
                        {definition}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {topic.gotchas?.length > 0 && (
              <div className="mt-7">
                <SectionLabel>Common pitfalls</SectionLabel>
                <ul className="space-y-2.5">
                  {topic.gotchas.map((gotcha) => (
                    <li
                      key={gotcha}
                      className="flex gap-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-slate-400"
                    >
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70"
                        aria-hidden="true"
                      />
                      <span>{gotcha}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topic.practice && (
              <div className="mt-7 rounded-xl border border-mint-400/20 bg-mint-400/[0.05] p-4">
                <SectionLabel>Try it now</SectionLabel>
                <p className="text-[12.5px] leading-relaxed text-slate-300">
                  {topic.practice}
                </p>
              </div>
            )}

            {topic.code && (
              <div className="mt-7">
                <SectionLabel>Spring Boot example</SectionLabel>
                <CodeBlock
                  file={topic.code.file}
                  lang={topic.code.lang}
                  code={topic.code.code}
                  heightClass="max-h-[58vh]"
                />
              </div>
            )}
          </div>

          <footer className="flex flex-col gap-3 border-t border-white/[0.08] bg-ink-950/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button
              type="button"
              onClick={() => onToggle(topic.id)}
              aria-pressed={done}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition ${
                done
                  ? "border-mint-400/40 bg-mint-400/10 text-mint-300"
                  : "border-white/12 text-slate-300 hover:border-mint-400/40 hover:text-mint-300"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                  done
                    ? "border-mint-400 bg-mint-400 text-ink-950"
                    : "border-slate-600"
                }`}
              >
                {done && <Check className="h-3 w-3" />}
              </span>
              {done ? "Completed" : "Mark complete"}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate(-1)}
                className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-slate-400 transition hover:border-white/25 hover:text-white"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => onNavigate(1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-slate-400 transition hover:border-white/25 hover:text-white"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
