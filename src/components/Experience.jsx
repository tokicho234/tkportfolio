'use client';

import Section from './Section';
import Reveal from './Reveal';
import { EXPERIENCE } from '@/lib/data';
import { usePortfolio } from '@/context/PortfolioContext';

export default function Experience() {
  const { t, tr, lang } = usePortfolio();
  return (
    <Section id="experience" title={t.expTitle}>
      <ol className="relative space-y-6 border-l border-slate-300 pl-6 dark:border-white/15 sm:pl-10">
        {EXPERIENCE.map((job, idx) => (
          <Reveal as="li" key={job.id} delay={idx * 0.1} className="relative">
            <span
              className={`absolute -left-[31px] top-7 h-3 w-3 rounded-full border-2 border-slate-50 sm:-left-[47px] dark:border-obsidian-950 ${
                idx === 0 ? 'bg-sky-600 shadow-[0_0_12px_2px_rgba(34,211,238,.6)] dark:bg-neon-cyan' : 'bg-slate-400 dark:bg-slate-600'
              }`}
              aria-hidden="true"
            />
            <article className="card transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg dark:hover:border-neon-cyan/30 dark:hover:shadow-glow">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{tr(job.org)}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{tr(job.period)}</p>
              </div>
              <p className="mt-1 font-medium text-sky-700 dark:text-neon-cyan">{tr(job.role)}</p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-slate-600 marker:text-slate-400 dark:text-slate-400">
                {job.points[lang].map((p) => <li key={p}>{p}</li>)}
              </ul>

              {job.project && (
                <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 dark:border-neon-cyan/20 dark:bg-neon-cyan/5">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{tr(job.project.title)}</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-400">
                    {job.project.points[lang].map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
