'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

const LINKS = ['about', 'experience', 'projects', 'skills', 'certificates', 'contact'];

export default function Navbar() {
  const { t, lang, toggleLang, theme, toggleTheme } = usePortfolio();
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-obsidian-950/75">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <a href="#top" className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          {lang === 'am' ? 'ተከታይ አዲስ' : 'Teketay Addis'}
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((k) => (
            <li key={k}>
              <a href={`#${k}`} className="link-underline rounded-full px-3 py-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                {t.nav[k]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            aria-label={t.toggleLang}
            className="flex items-center rounded-full border border-slate-300 p-0.5 text-xs font-semibold dark:border-white/15"
          >
            {['en', 'am'].map((l) => (
              <span
                key={l}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === l ? 'bg-slate-900 text-white dark:bg-neon-cyan dark:text-obsidian-950' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {l.toUpperCase()}
              </span>
            ))}
          </button>
          <button
            onClick={toggleTheme}
            aria-label={t.toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t.closeMenu : t.openMenu}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-slate-700 dark:border-white/15 dark:text-slate-200 lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-sky-500 dark:bg-neon-cyan" />

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200 bg-white px-5 dark:border-white/10 dark:bg-obsidian-950 lg:hidden"
          >
            {LINKS.map((k) => (
              <li key={k}>
                <a href={`#${k}`} onClick={() => setOpen(false)} className="block py-3 text-slate-700 dark:text-slate-300">
                  {t.nav[k]}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
