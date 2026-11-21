# Backend Roadmap — Java & Spring Boot Field Guide

A personal, interactive backend engineering roadmap built with React and Tailwind CSS. The structure follows [roadmap.sh/backend](https://roadmap.sh/backend), regrouped into ten phases you can actually work through in order.

Instead of linking out to a dozen sites for every topic, each node opens a self-contained reading panel: what the idea is, the terms you need, the traps beginners fall into, a small exercise, and the Java/Spring Boot version of the concept where it applies.

## What's inside

- **10 phases, 76 topics** — from how the web works to scaling, observability and AI-augmented backends.
- **Expanded notes for every topic** — overview, 3 key terms, 2 common pitfalls and one practice task, all in a slide-over panel so you never lose your place on the roadmap.
- **24 Spring Boot code examples** — annotated Java snippets for the topics where code explains the idea better than prose.
- **A 14-chapter guided tutorial** — "Spring Boot from zero to deployed", a linear track that builds the link shortener project chapter by chapter, each with a goal, steps, code, common mistakes and a checkpoint.
- **8 build projects** — grouped into Beginner, Intermediate and Pro, each with requirements, stretch goals and a suggested phase order. The link shortener is marked as the tutorial project.
- **Progress tracking** — tick topics you can explain without notes; progress is saved in `localStorage` (`backend-roadmap-progress-v1`).
- **Search and filtering** — search across titles, notes, terms, pitfalls and code filenames, plus a "hide completed" filter.
- **Responsive layout** — phase rail on desktop, scrollable phase chips on phones, and full-width reading panels on small screens.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Animation | Framer Motion |
| Code highlighting | Prism via `prism-react-renderer` |

No backend, no database, no accounts: the site is fully static and all state lives in the browser.

## Getting started

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`). To use a fixed port:

```bash
npm run dev -- --port 5174 --strictPort
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot module replacement |
| `npm run build` | Type-free production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

### Deploying under a sub-path

The build reads an optional base path, so the site can live at `https://example.com/roadmap/`:

```bash
VITE_BASE_PATH=/roadmap/ npm run build
```

`dist/` is ready for GitHub Pages, Netlify, Vercel or any static host.

## Project structure

```text
src/
├── main.jsx                  # React entry point
├── App.jsx                   # Layout, search/filter state, drawer coordination
├── index.css                 # Tailwind import, theme tokens, base styles
├── components/
│   ├── Navbar.jsx            # Sticky nav with progress and section links
│   ├── Hero.jsx              # Landing section with stats
│   ├── Marquee.jsx           # Scrolling topic strip
│   ├── PhaseSection.jsx      # One roadmap phase and its topic cards
│   ├── TopicCard.jsx         # Individual topic row with checkbox
│   ├── TopicDrawer.jsx       # Slide-over reading panel for a topic
│   ├── TutorialSection.jsx   # Tutorial intro, prerequisites, chapter grid
│   ├── ChapterDrawer.jsx     # Slide-over panel for a tutorial chapter
│   ├── ProjectsSection.jsx   # Projects grouped by difficulty tier
│   ├── CodeBlock.jsx         # Prism-highlighted code block
│   ├── Icons.jsx             # Inline SVG icon set
│   └── Footer.jsx            # Links and track status
├── hooks/
│   └── useProgress.js        # localStorage-backed progress state
└── data/
    ├── roadmap.js            # Phases, topics, code examples; merges topicDetails
    ├── topicDetails.js       # Expanded notes keyed by topic id
    ├── tutorial.js           # Tutorial meta + 14 chapters
    └── projects.js           # 8 projects with requirements and phases
```

## Editing the content

All content is plain data; no CMS or build step is needed.

**Add or change a topic** in `src/data/roadmap.js`:

```js
{
  id: "idempotency-keys",
  title: "Idempotency keys",
  blurb: "Safe retries for POST requests.",
  points: ["Clients generate a key per intent", "Servers replay the stored response"],
  code: {
    file: "IdempotencyFilter.java",
    lang: "java",
    code: `// ...`,
  },
}
```

Topics are collected into `allTopics`, which drives search, progress totals and the reading panel.

**Add expanded notes** in `src/data/topicDetails.js`, keyed by the same topic `id`. Each entry supplies `overview`, `terms` (pairs of term and definition), `gotchas` and `practice`. A topic without an entry still works; it just shows the short blurb.

**Add a tutorial chapter** in `src/data/tutorial.js` with `id`, `number`, `title`, `tagline`, `time`, `goal`, `steps`, `code` (optional), `extraCode` (optional supporting files), `pitfalls`, `checkpoint` and `projectMilestone`.

**Add a project** in `src/data/projects.js` with `id`, `title`, `tier` (`Beginner` | `Intermediate` | `Pro`), `level`, `duration`, `pitch`, `brief`, `stack`, `phases`, `requirements`, `stretch`, `proves` and an optional `tutorial: true` flag.

The reading panels only open one at a time: opening a topic closes the tutorial chapter and vice versa.

## Notes and attribution

- The roadmap structure is inspired by [roadmap.sh/backend](https://roadmap.sh/backend). This site is an independent study companion, not affiliated with roadmap.sh.
- All written notes and code examples were produced for this guide.
- Java examples target Java 21 and Spring Boot 3.
- Python/FastAPI notes are planned as a later track; the UI already marks them as upcoming.

Built as a personal reference, 2026.
