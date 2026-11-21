import { motion } from "framer-motion";
import { ArrowRight, Check, CodeIcon } from "./Icons.jsx";

export default function TopicCard({ topic, done, onToggle, onOpen }) {
  return (
    <motion.article
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border transition-colors ${
        done
          ? "border-mint-400/25 bg-mint-400/[0.045]"
          : "card-sheen border-white/[0.08] hover:border-white/20"
      }`}
    >
      {done && (
        <span
          className="absolute inset-y-5 left-0 w-[2px] rounded-full bg-mint-400/60"
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-base font-semibold tracking-tight sm:text-[17px]">
            <button
              type="button"
              onClick={() => onOpen(topic.id)}
              className={`text-left transition hover:text-mint-300 ${
                done ? "text-slate-200" : "text-white"
              }`}
            >
              {topic.title}
            </button>
          </h4>

          <button
            type="button"
            onClick={() => onToggle(topic.id)}
            aria-pressed={done}
            aria-label={
              done
                ? `Mark ${topic.title} as not started`
                : `Mark ${topic.title} as complete`
            }
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
              done
                ? "border-mint-400 bg-mint-400 text-ink-950"
                : "border-white/20 text-transparent hover:border-mint-400/70 hover:bg-mint-400/10"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-400">
          {topic.blurb}
        </p>

        <ul className="mt-4 flex-1 space-y-2">
          {topic.points.map((point) => (
            <li
              key={point}
              className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-500"
            >
              <span
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-600 group-hover:bg-mint-400/70"
                aria-hidden="true"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onOpen(topic.id)}
          className="mt-5 flex w-full items-center justify-between gap-2 border-t border-white/[0.07] pt-4 text-left font-mono text-[11px] text-mint-300/90 transition hover:text-mint-300"
        >
          <span className="flex min-w-0 items-center gap-2">
            {topic.code ? (
              <CodeIcon className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">
              {topic.code ? "Open example" : "Read topic"}
              {topic.code && (
                <span className="hidden text-slate-500 sm:inline">
                  {" "}
                  · {topic.code.file}
                </span>
              )}
            </span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.article>
  );
}
