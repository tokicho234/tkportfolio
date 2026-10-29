'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Award, ChevronDown, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import Section from './Section';
import Reveal from './Reveal';
import { usePortfolio } from '@/context/PortfolioContext';

const imgUrl = (c) => `/api/cert-image/${encodeURIComponent(c.id)}?v=${c.imageVersion}`;

// Gentle 3D tilt that follows the pointer.
function Tilt({ children }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), spring);
  if (reduce) return children;
  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

export default function Certificates() {
  const { t, tr, data } = usePortfolio();
  const [openId, setOpenId] = useState(null);
  const [lightboxId, setLightboxId] = useState(null);

  const withImage = data.certs.filter((c) => c.imageVersion);
  const idx = withImage.findIndex((c) => c.id === lightboxId);
  const current = idx >= 0 ? withImage[idx] : null;
  const step = useCallback(
    (d) => setLightboxId(withImage[(idx + d + withImage.length) % withImage.length].id),
    [idx, withImage]
  );

  useEffect(() => {
    if (idx < 0) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxId(null);
      if (e.key === 'ArrowLeft' && withImage.length > 1) step(-1);
      if (e.key === 'ArrowRight' && withImage.length > 1) step(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [idx, step, withImage.length]);

  return (
    <Section id="certificates" title={t.certTitle}>
      {data.certs.length === 0 ? (
        <p className="text-slate-500">{t.empty}</p>
      ) : (
        <ul className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.certs.map((c, i) => {
            const open = openId === c.id;
            return (
              <Reveal as="li" key={c.id} delay={(i % 3) * 0.1}>
                <Tilt>
                  <article className="card group overflow-hidden !p-0 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
                    {c.imageVersion ? (
                      <button
                        onClick={() => setLightboxId(c.id)}
                        aria-label={`${t.viewCert}: ${c.title}`}
                        className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-obsidian-900"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl(c)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute inset-0 grid place-items-center bg-slate-900/0 transition-colors duration-300 group-hover:bg-slate-900/40 group-focus-within:bg-slate-900/40">
                          <span className="flex translate-y-2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                            <Maximize2 size={13} /> {t.viewCert}
                          </span>
                        </span>
                      </button>
                    ) : null}

                    <div className="p-6">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-neon-cyan/10 dark:text-neon-cyan">
                          <Award size={20} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">{c.title}</h3>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.issuer}</p>
                          <p className="mt-0.5 text-sm text-slate-500">{c.date}</p>
                        </div>
                      </div>

                      {c.detail ? (
                        <>
                          <button
                            onClick={() => setOpenId(open ? null : c.id)}
                            aria-expanded={open}
                            className="mt-4 flex items-center gap-1 text-sm font-medium text-sky-700 dark:text-neon-cyan"
                          >
                            {open ? t.hideDetails : t.showDetails}
                            <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
                              >
                                {tr(c.detail)}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </>
                      ) : null}
                    </div>
                  </article>
                </Tilt>
              </Reveal>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxId(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-950/85 p-4 backdrop-blur-sm"
          >
            <button
              autoFocus
              onClick={() => setLightboxId(null)}
              aria-label={t.close}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X size={20} />
            </button>

            {withImage.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label={t.prev} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronLeft size={22} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label={t.next} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <motion.img
              key={current.id}
              src={imgUrl(current)}
              alt={current.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div onClick={(e) => e.stopPropagation()} className="text-center text-white">
              <p className="font-semibold">{current.title}</p>
              <p className="text-sm text-slate-300">{current.issuer}, {current.date}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
