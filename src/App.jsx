import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import PhaseSection from "./components/PhaseSection.jsx";
import ProjectsSection from "./components/ProjectsSection.jsx";
import TutorialSection from "./components/TutorialSection.jsx";
import TopicDrawer from "./components/TopicDrawer.jsx";
import ChapterDrawer from "./components/ChapterDrawer.jsx";
import Footer from "./components/Footer.jsx";
import { ArrowRight, Check, Rotate, Search, Sparkle } from "./components/Icons.jsx";
import { useProgress } from "./hooks/useProgress.js";
import { allTopics, phases, totalTopics } from "./data/roadmap.js";
import { chapters } from "./data/tutorial.js";

function matches(topic, phase, query) {
  if (!query) return true;
  const haystack = [
    topic.title,
    topic.blurb,
    phase.title,
    topic.overview ?? "",
    ...topic.points,
    ...(topic.terms ?? []).flat(),
    ...(topic.gotchas ?? []),
    topic.practice ?? "",
    topic.code?.file ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function App() {
  const { done, toggle, reset } = useProgress();
  const [query, setQuery] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);

  const doneSet = useMemo(() => new Set(done), [done]);

  const exampleCount = useMemo(
    () => allTopics.filter((topic) => topic.code).length,
    [],
  );

  const doneCount = done.length;
  const percent = totalTopics ? Math.round((doneCount / totalTopics) * 100) : 0;

  const filteredPhases = useMemo(() => {
    return phases
      .map((phase) => ({
        ...phase,
        topics: phase.topics.filter(
          (topic) =>
            matches(topic, phase, query) &&
            !(hideCompleted && doneSet.has(topic.id)),
        ),
      }))
      .filter((phase) => phase.topics.length > 0);
  }, [query, hideCompleted, doneSet]);

  const visibleCount = filteredPhases.reduce(
    (sum, phase) => sum + phase.topics.length,
    0,
  );

  const activeTopic = activeId
    ? allTopics.find((topic) => topic.id === activeId)
    : null;

  const activeIndex = activeTopic
    ? allTopics.findIndex((topic) => topic.id === activeTopic.id)
    : -1;

  const activeChapter = activeChapterId
    ? chapters.find((chapter) => chapter.id === activeChapterId)
    : null;

  const activeChapterIndex = activeChapter
    ? chapters.findIndex((chapter) => chapter.id === activeChapter.id)
    : -1;

  const closeTopic = useCallback(() => setActiveId(null), []);
  const closeChapter = useCallback(() => setActiveChapterId(null), []);

  // Only one reading panel at a time.
  const openTopic = useCallback((id) => {
    setActiveChapterId(null);
    setActiveId(id);
  }, []);

  const openChapter = useCallback((id) => {
    setActiveId(null);
    setActiveChapterId(id);
  }, []);

  const navigateChapter = useCallback(
    (delta) => {
      const next = activeChapterIndex + delta;
      if (next < 0 || next >= chapters.length) return;
      setActiveChapterId(chapters[next].id);
    },
    [activeChapterIndex],
  );

  const navigateTopic = useCallback(
    (delta) => {
      if (activeIndex < 0) return;
      const next = (activeIndex + delta + allTopics.length) % allTopics.length;
      setActiveId(allTopics[next].id);
    },
    [activeIndex],
  );

  const countDone = (phase) =>
    phase.topics.filter((topic) => doneSet.has(topic.id)).length;

  return (
    <div className="relative min-h-screen bg-ink-950">
      <a
        href="#roadmap"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-mint-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-950"
      >
        Skip to roadmap
      </a>

      <Navbar doneCount={doneCount} total={totalTopics} />

      <div
        className="fixed inset-x-0 top-16 z-40 h-px bg-white/[0.06]"
        aria-hidden="true"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-mint-400 to-iris-400"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <main>
        <Hero doneCount={doneCount} exampleCount={exampleCount} />
        <Marquee />

        {/* ---------- progress ---------- */}
        <section id="progress" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-6 sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-mint-500/10 blur-3xl"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-lg">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mint-300">
                    <Sparkle className="h-3.5 w-3.5" />
                    Your progress
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {percent >= 100
                      ? "Every topic checked. Time to build."
                      : percent === 0
                        ? "Start anywhere. Just start."
                        : `${percent}% mapped. Keep going.`}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Tick topics as you can explain them without notes. Progress is
                    stored locally in this browser — no account, no tracking.
                  </p>
                </div>

                <div className="flex items-end gap-6">
                  <div>
                    <p className="font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                      {percent}
                      <span className="text-2xl text-slate-500">%</span>
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      {doneCount} / {totalTopics} topics complete
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    disabled={doneCount === 0}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-[11px] text-slate-400 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Rotate className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-mint-500 via-mint-400 to-iris-400"
                  initial={false}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- roadmap ---------- */}
        <section id="roadmap" className="scroll-mt-20">
          <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  The path · {phases.length} phases
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Ten phases, one backend engineer.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  The roadmap.sh backend map, grouped into a sequence you can
                  follow. Open any topic in the reading panel for the full notes and
                  the Spring Boot version of that idea.
                </p>
              </div>
              <a
                href="#projects"
                className="group inline-flex shrink-0 items-center gap-2 font-mono text-[11px] text-slate-400 transition hover:text-mint-300"
              >
                Skip ahead to the projects
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* filters */}
          <div className="sticky top-16 z-30 mt-8 border-y border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <label className="relative flex w-full items-center sm:max-w-md">
                <span className="sr-only">Search the roadmap</span>
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search topics, e.g. caching, JWT, indexes…"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-[13px] text-slate-200 placeholder:text-slate-600 transition focus:border-mint-400/50 focus:bg-white/[0.05] focus:outline-none"
                />
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHideCompleted((value) => !value)}
                  aria-pressed={hideCompleted}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11px] transition ${
                    hideCompleted
                      ? "border-mint-400/40 bg-mint-400/10 text-mint-300"
                      : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${
                      hideCompleted
                        ? "border-mint-400 bg-mint-400 text-ink-950"
                        : "border-slate-600"
                    }`}
                  >
                    {hideCompleted && <Check className="h-2.5 w-2.5" />}
                  </span>
                  Hide completed
                </button>
                <p className="font-mono text-[11px] text-slate-500">
                  {visibleCount} topic{visibleCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
              {/* phase rail */}
              <aside className="hidden lg:block">
                <nav
                  aria-label="Roadmap phases"
                  className="sticky top-36 border-l border-white/[0.08] pl-4"
                >
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    Phases
                  </p>
                  <div className="space-y-0.5">
                    {phases.map((phase) => (
                      <a
                        key={phase.id}
                        href={`#${phase.id}`}
                        className="group flex items-baseline gap-2.5 rounded-r-md px-2 py-1.5 text-slate-500 transition hover:bg-white/[0.03] hover:text-slate-200"
                      >
                        <span className="font-mono text-[10px] text-slate-600 group-hover:text-mint-400">
                          {phase.number}
                        </span>
                        <span className="flex-1 text-[12.5px] leading-snug">
                          {phase.title}
                        </span>
                        <span className="font-mono text-[9px] text-slate-600">
                          {countDone(phase)}/{phase.topics.length}
                        </span>
                      </a>
                    ))}
                  </div>

                  <div className="mt-4 space-y-0.5 border-t border-white/[0.08] pt-3">
                    <a
                      href="#tutorial"
                      className="flex items-baseline gap-2.5 rounded-r-md px-2 py-1.5 text-slate-400 transition hover:bg-white/[0.03] hover:text-mint-300"
                    >
                      <span className="font-mono text-[10px] text-mint-400/80">
                        §
                      </span>
                      <span className="flex-1 text-[12.5px] leading-snug">
                        Guided tutorial
                      </span>
                    </a>
                    <a
                      href="#projects"
                      className="flex items-baseline gap-2.5 rounded-r-md px-2 py-1.5 text-slate-400 transition hover:bg-white/[0.03] hover:text-mint-300"
                    >
                      <span className="font-mono text-[10px] text-mint-400/80">
                        →
                      </span>
                      <span className="flex-1 text-[12.5px] leading-snug">
                        Build projects
                      </span>
                    </a>
                    <a
                      href="#progress"
                      className="flex items-baseline gap-2.5 rounded-r-md px-2 py-1.5 text-slate-500 transition hover:bg-white/[0.03] hover:text-slate-200"
                    >
                      <span className="font-mono text-[10px] text-slate-600">
                        %
                      </span>
                      <span className="flex-1 text-[12.5px] leading-snug">
                        Progress
                      </span>
                    </a>
                  </div>
                </nav>
              </aside>

              <div className="min-w-0">
                {/* mobile phase chips */}
                <nav
                  aria-label="Roadmap phases"
                  className="mb-8 flex w-full min-w-0 gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {phases.map((phase) => (
                    <a
                      key={phase.id}
                      href={`#${phase.id}`}
                      className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10.5px] text-slate-400 transition hover:border-mint-400/40 hover:text-mint-300"
                    >
                      {phase.number} · {phase.title}
                    </a>
                  ))}
                  <a
                    href="#tutorial"
                    className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10.5px] text-slate-400 transition hover:border-mint-400/40 hover:text-mint-300"
                  >
                    Tutorial
                  </a>
                  <a
                    href="#projects"
                    className="shrink-0 rounded-full border border-mint-400/30 bg-mint-400/[0.07] px-3 py-1.5 font-mono text-[10.5px] text-mint-300 transition hover:border-mint-400/60"
                  >
                    Projects →
                  </a>
                </nav>

                <div className="space-y-16 sm:space-y-20">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredPhases.map((phase) => (
                      <motion.div
                        key={phase.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PhaseSection
                          phase={phase}
                          isDone={(id) => doneSet.has(id)}
                          onToggle={toggle}
                          onOpen={openTopic}
                          totalDone={countDone(phase)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredPhases.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/12 px-6 py-16 text-center">
                      <p className="font-display text-lg font-medium text-slate-200">
                        Nothing matches “{query}”
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Try a broader term, or clear the filters to see the full path.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setHideCompleted(false);
                        }}
                        className="mt-5 rounded-lg border border-white/12 px-4 py-2 text-xs text-slate-300 transition hover:border-mint-400/40 hover:text-mint-300"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <TutorialSection onOpen={openChapter} />

        <ProjectsSection />

        {/* ---------- stack ---------- */}
        <section id="stack" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    The stack
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    One language, deeply. Then another.
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                  The roadmap is language-agnostic. Examples here use Java because
                  the backend job market runs on it — Python arrives in a later update.
                </p>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-mint-400/25 bg-mint-400/[0.05] p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base font-semibold text-white">
                      Java · Spring Boot
                    </p>
                    <span className="flex items-center gap-1.5 rounded-full border border-mint-400/30 bg-mint-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mint-300">
                      <span className="h-1 w-1 rounded-full bg-mint-400" />
                      active
                    </span>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-slate-400">
                    Java 21, Spring Boot 3, Spring Data JPA, Spring Security,
                    PostgreSQL, Redis, Kafka, Testcontainers, Docker and
                    OpenTelemetry — the examples follow these versions.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Java 21", "Spring Boot 3", "JPA", "Security", "JUnit 5"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-slate-400"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.015] p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base font-semibold text-slate-300">
                      Python · FastAPI
                    </p>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                      planned
                    </span>
                  </div>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-slate-500">
                    Same phases, different idioms: async endpoints, Pydantic
                    validation, SQLAlchemy, Alembic and pytest. Added once the Java
                    track is complete.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Python 3.13", "FastAPI", "SQLAlchemy", "Alembic", "pytest"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded border border-white/[0.07] px-2 py-0.5 font-mono text-[10px] text-slate-600"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <TopicDrawer
        topic={activeTopic}
        done={activeTopic ? doneSet.has(activeTopic.id) : false}
        onClose={closeTopic}
        onToggle={toggle}
        onNavigate={navigateTopic}
      />

      <ChapterDrawer
        chapter={activeChapter}
        index={activeChapterIndex}
        total={chapters.length}
        onClose={closeChapter}
        onNavigate={navigateChapter}
      />
    </div>
  );
}
