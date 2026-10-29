'use client';

import { motion } from 'framer-motion';
import Section from './Section';
import Reveal from './Reveal';
import { CATEGORIES } from '@/lib/data';
import { usePortfolio } from '@/context/PortfolioContext';

export default function Skills() {
  const { t, data } = usePortfolio();
  return (
    <Section id="skills" title={t.skillsTitle}>
      <p className="-mt-6 mb-8 text-sm text-slate-500 dark:text-slate-400">{t.skillsHint}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((cat, ci) => {
          const items = data.skills.filter((s) => s.category === cat);
          return (
            <Reveal key={cat} delay={(ci % 2) * 0.1}>
            <div className="card h-full transition duration-300 hover:shadow-glow">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">{t.cat[cat]}</h3>
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">{t.empty}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {items.map((s, i) => (
                    <motion.li
                      key={s.id}
                      title={`${s.level}%`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.35, delay: Math.min(i * 0.03, 0.5) } }}
                      whileHover={{ scale: 1.06, y: -2, transition: { duration: 0.15, delay: 0 } }}
                      viewport={{ once: true }}
                      className="group relative overflow-hidden rounded-full border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-sm text-slate-800 dark:border-white/15 dark:bg-obsidian-900 dark:text-slate-200"
                    >
                      <motion.span
                        aria-hidden="true"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="absolute inset-y-0 left-0 bg-sky-200/70 dark:bg-neon-cyan/20"
                      />
                      <span className="relative">{s.name}</span>
                      <span className="relative ml-2 hidden text-xs text-slate-500 group-hover:inline dark:text-slate-400">{s.level}%</span>
                      <span className="sr-only">{`, ${s.level}%`}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
