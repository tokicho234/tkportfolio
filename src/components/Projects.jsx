'use client';

import Section from './Section';
import Reveal from './Reveal';
import { usePortfolio } from '@/context/PortfolioContext';

export default function Projects() {
  const { t, tr, data } = usePortfolio();
  return (
    <Section id="projects" title={t.projTitle}>
      {data.projects.length === 0 ? (
        <p className="text-slate-500">{t.empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 0.1} className={i === 0 ? 'md:col-span-2' : ''}>
            <article className="card h-full transition duration-300 hover:-translate-y-1 hover:shadow-glow">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{tr(p.title)}</h3>
              <p className="mt-2 max-w-prose text-slate-600 dark:text-slate-400">{tr(p.desc)}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {(p.tags || '').split(',').map((x) => x.trim()).filter(Boolean).map((tag) => (
                  <li key={tag} className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-sky-500 hover:text-sky-700 dark:border-white/15 dark:text-slate-400 dark:hover:border-neon-cyan dark:hover:text-neon-cyan">
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
