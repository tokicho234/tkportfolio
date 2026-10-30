'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Box, Camera, Download, Server, ShieldCheck } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[2rem] bg-slate-100 dark:bg-white/5" />,
});

export default function Hero() {
  const { t, data, setHeroMode, theme } = usePortfolio();
  const mode = data.heroMode;

  return (
    <section id="top" className="relative overflow-hidden pt-16">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl dark:bg-neon-blue/20" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
          <p className="text-base text-slate-500 dark:text-slate-400">{t.greeting}</p>
          <h1 className="mt-2 text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            {t.name}
          </h1>
          <p className="mt-5 max-w-xl text-xl font-medium text-sky-700 dark:text-neon-cyan">{t.title}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400">{t.blurb}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={data.cvVersion ? `/api/cv?v=${data.cvVersion}` : '/Teketay_Addis_CV.pdf'} download className="btn btn-primary">
              <Download size={16} /> {t.cvBtn}
            </a>
            <a href="#experience" className="btn btn-ghost">{t.expBtn}</a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          className="relative h-[400px] sm:h-[480px]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/60 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-obsidian-900/70 dark:shadow-glow">
            {mode === '3d' ? (
              <HeroScene color={theme === 'dark' ? '#22d3ee' : '#0369a1'} />
            ) : data.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.photo} alt={t.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-obsidian-800 dark:to-obsidian-900">
                <span className="text-7xl font-semibold text-slate-400 dark:text-slate-600" aria-label={t.name}>TA</span>
              </div>
            )}
          </div>

          <div className="absolute left-4 top-4 flex rounded-full border border-slate-200 bg-white/90 p-0.5 text-xs font-semibold backdrop-blur dark:border-white/10 dark:bg-obsidian-950/80" role="group">
            {[
              ['3d', Box, t.view3d],
              ['photo', Camera, t.viewPhoto],
            ].map(([k, Icon, label]) => (
              <button
                key={k}
                onClick={() => setHeroMode(k)}
                aria-pressed={mode === k}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
                  mode === k ? 'bg-slate-900 text-white dark:bg-neon-cyan dark:text-obsidian-950' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          <div className="absolute -bottom-3 left-6 flex animate-drift items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-lg dark:border-white/10 dark:bg-obsidian-800">
            <ShieldCheck size={16} className="text-sky-600 dark:text-neon-cyan" /> MIDAS
          </div>
          <div className="absolute -right-2 bottom-16 flex animate-drift items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-lg [animation-delay:1.5s] dark:border-white/10 dark:bg-obsidian-800">
            <Server size={16} className="text-sky-600 dark:text-neon-cyan" /> PISCES 9.3
          </div>
        </motion.div>
      </div>
    </section>
  );
}
