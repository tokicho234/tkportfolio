'use client';

import { GraduationCap } from 'lucide-react';
import Section from './Section';
import Reveal from './Reveal';
import { usePortfolio } from '@/context/PortfolioContext';

const lift = 'transition duration-300 hover:-translate-y-1 hover:shadow-glow';

export default function About() {
  const { t, data } = usePortfolio();
  return (
    <Section id="about" title={t.aboutTitle}>
      <div className="grid gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4 md:row-span-2">
          <div className={`card h-full ${lift}`}>
            <p className="max-w-prose text-lg leading-relaxed text-slate-700 dark:text-slate-300">{t.about}</p>
            <div className="mt-8 flex items-start gap-4 rounded-2xl bg-slate-100 p-4 dark:bg-white/5">
              <GraduationCap className="mt-0.5 shrink-0 text-sky-600 dark:text-neon-cyan" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{t.eduDegree}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t.eduSchool}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="md:col-span-2" delay={0.1}>
          <div className={`card h-full ${lift}`}>
            <p className="text-5xl font-semibold text-slate-900 dark:text-white">6+</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.stats.years}</p>
          </div>
        </Reveal>
        <Reveal className="md:col-span-1" delay={0.18}>
          <div className={`card h-full ${lift}`}>
            <p className="text-4xl font-semibold text-slate-900 dark:text-white">3.53</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.stats.gpa}</p>
          </div>
        </Reveal>
        <Reveal className="md:col-span-1" delay={0.26}>
          <div className={`card h-full ${lift}`}>
            <p className="text-4xl font-semibold text-slate-900 dark:text-white">{data.certs.length}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.stats.certs}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
