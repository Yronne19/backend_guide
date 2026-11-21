import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Close } from "./Icons.jsx";
import CodeBlock from "./CodeBlock.jsx";

function Label({ children }) {
  return (
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
      {children}
    </p>
  );
}

export default function ChapterDrawer({ chapter, index, total, onClose, onNavigate }) {
  const closeRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!chapter) return undefined;

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
  }, [chapter, onClose]);

  return (
    <AnimatePresence>
      {chapter && (
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

      {chapter && (
        <motion.aside
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chapter-drawer-title"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-2xl flex-col border-l border-white/[0.1] bg-ink-900 shadow-[0_0_80px_rgba(0,0,0,0.7)] lg:max-w-3xl"
        >
          <header className="flex items-start gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-7 sm:py-5">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mint-300">
                Chapter {chapter.number} of {total} · {chapter.time}
              </p>
              <h2
                id="chapter-drawer-title"
                className="mt-2 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl"
              >
                {chapter.title}
              </h2>
              <p className="mt-1.5 text-[12.5px] text-slate-500">{chapter.tagline}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-white/25 hover:text-white"
              aria-label="Close chapter"
            >
              <Close className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <Label>Goal of this chapter</Label>
              <p className="text-[13px] leading-relaxed text-slate-300">{chapter.goal}</p>
            </div>

            <div className="mt-7">
              <Label>Step by step</Label>
              <ol className="space-y-3">
                {chapter.steps.map((step, i) => (
                  <li
                    key={step}
                    className="flex gap-3 text-[13px] leading-relaxed text-slate-400"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[10px] text-mint-300">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {chapter.code && (
              <div className="mt-7">
                <Label>Code for this chapter</Label>
                <CodeBlock
                  file={chapter.code.file}
                  lang={chapter.code.lang}
                  code={chapter.code.code}
                  heightClass="max-h-[52vh]"
                />
              </div>
            )}

            {chapter.extraCode && (
              <div className="mt-5">
                <Label>Supporting file</Label>
                <CodeBlock
                  file={chapter.extraCode.file}
                  lang={chapter.extraCode.lang}
                  code={chapter.extraCode.code}
                  heightClass="max-h-[34vh]"
                />
              </div>
            )}

            {chapter.pitfalls?.length > 0 && (
              <div className="mt-7">
                <Label>Common mistakes</Label>
                <ul className="space-y-2.5">
                  {chapter.pitfalls.map((pitfall) => (
                    <li
                      key={pitfall}
                      className="flex gap-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-slate-400"
                    >
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70"
                        aria-hidden="true"
                      />
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-7 rounded-xl border border-mint-400/25 bg-mint-400/[0.06] p-4">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-mint-300">
                <Check className="h-3.5 w-3.5" /> Checkpoint
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-300">
                {chapter.checkpoint}
              </p>
              <p className="mt-3 border-t border-mint-400/15 pt-3 font-mono text-[11px] leading-relaxed text-slate-500">
                Project: {chapter.projectMilestone}
              </p>
            </div>
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-white/[0.08] bg-ink-950/60 px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              disabled={index === 0}
              className="rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-slate-400 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="font-mono text-[10px] text-slate-600">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              disabled={index === total - 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-slate-400 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
