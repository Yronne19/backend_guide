import { motion } from "framer-motion";
import { Check, CodeIcon } from "./Icons.jsx";
import { projects } from "../data/projects.js";

const tiers = [
  {
    name: "Beginner",
    note: "One feature at a time. Finish something you can run and explain.",
  },
  {
    name: "Intermediate",
    note: "Add concurrency, money, caching or realtime — the parts that punish shortcuts.",
  },
  {
    name: "Pro",
    note: "Production-shaped: tenants, scale, observability and a rollback plan.",
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Build track · {projects.length} projects
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Read less. Build these, in order.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Start with the tutorial project, then repeat the same loop without a
            guide. Each project adds one new hard problem and ends in something you
            can demo in an interview. Requirements are a definition of done, not a
            suggestion.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {tiers.map((tier) => {
            const items = projects.filter((project) => project.tier === tier.name);
            if (items.length === 0) return null;

            return (
              <div key={tier.name}>
                <div className="flex flex-col gap-1 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                    {tier.name}
                    <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-slate-500">
                      {items.length} project{items.length === 1 ? "" : "s"}
                    </span>
                  </h3>
                  <p className="max-w-md text-[12.5px] leading-relaxed text-slate-500">
                    {tier.note}
                  </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((project, index) => (
                    <motion.article
                      key={project.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.45, delay: index * 0.06 }}
                      className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 sm:p-6 ${
                        project.tier === "Pro"
                          ? "border-mint-400/25 bg-gradient-to-b from-mint-400/[0.08] to-white/[0.015]"
                          : "border-white/[0.08] bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                          <span className="text-mint-300">{project.level}</span>
                          {project.tier}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {project.duration}
                        </span>
                      </div>

                      {project.tutorial && (
                        <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded border border-mint-400/30 bg-mint-400/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-mint-300">
                          Built in the tutorial
                        </span>
                      )}

                      <h4 className="mt-3 font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                        {project.title}
                      </h4>
                      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                        {project.pitch}
                      </p>
                      <p className="mt-4 text-[12.5px] leading-relaxed text-slate-500">
                        {project.brief}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {project.stack.map((item) => (
                          <span
                            key={item}
                            className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-slate-400"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6">
                        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                          <CodeIcon className="h-3.5 w-3.5" />
                          Definition of done
                        </p>
                        <ul className="mt-3 space-y-2">
                          {project.requirements.map((requirement) => (
                            <li
                              key={requirement}
                              className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-400"
                            >
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-400/80" />
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 flex-1" />

                      <div className="border-t border-white/[0.07] pt-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                          Stretch goals
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {project.stretch.map((item) => (
                            <li
                              key={item}
                              className="text-[12px] leading-relaxed text-slate-500"
                            >
                              + {item}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 font-mono text-[10px] leading-relaxed text-slate-600">
                          Phases {project.phases.join(" · ")} · {project.proves}
                        </p>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
