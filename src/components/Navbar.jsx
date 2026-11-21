import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Close, Menu } from "./Icons.jsx";

const links = [
  { href: "#roadmap", label: "Roadmap" },
  { href: "#tutorial", label: "Tutorial" },
  { href: "#projects", label: "Projects" },
  { href: "#progress", label: "Progress" },
  { href: "#stack", label: "Stack" },
];

export default function Navbar({ doneCount, total }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="group flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-mint-400/30 bg-mint-400/10 font-mono text-sm font-semibold text-mint-300 transition group-hover:border-mint-400/60">
            {"{}"}
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-mint-400 pulse-dot" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight text-white">
              backend<span className="text-mint-400">.</span>roadmap
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Java · Spring Boot
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 sm:flex">
            <span className="relative flex h-7 w-7 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-7 w-7 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#4fe0ae"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(percent / 100) * 94.2} 94.2`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute font-mono text-[8px] font-medium text-mint-300">{percent}</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {doneCount}/{total} done
            </span>
          </div>

          <a
            href="https://roadmap.sh/backend"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-mint-400/40 hover:text-mint-300 sm:block"
          >
            Source roadmap
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://roadmap.sh/backend"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-2.5 text-sm text-mint-300 transition hover:bg-white/5"
              >
                Source roadmap ↗
              </a>
              <p className="px-3 pt-2 font-mono text-[11px] text-slate-500">
                {percent}% complete · {doneCount} of {total} topics
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
