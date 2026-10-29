'use client';

import Reveal from './Reveal';

export default function Section({ id, title, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 ${className}`}>
      <Reveal className="mb-10">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}
