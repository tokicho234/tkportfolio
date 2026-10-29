'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Section from './Section';
import Reveal from './Reveal';
import { api } from '@/lib/api';
import { usePortfolio } from '@/context/PortfolioContext';

const EMAIL = 'teketay2024@gmail.com';
const PHONE = '+251918991196';

export default function Contact() {
  const { t } = usePortfolio();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setStatus('sending');
    try {
      await api.sendContact({ name: f.get('name'), email: f.get('email'), message: f.get('message'), website: f.get('website') });
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  const info = [
    [Mail, t.email, EMAIL, `mailto:${EMAIL}`],
    [Phone, t.phone, PHONE, `tel:${PHONE}`],
    [MapPin, t.location, t.locationValue, null],
  ];

  return (
    <Section id="contact" title={t.contactTitle}>
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
        <div className="card h-full space-y-5 transition duration-300 hover:shadow-glow">
          <p className="text-slate-600 dark:text-slate-400">{t.contactLead}</p>
          {info.map(([Icon, label, value, href]) => (
            <div key={label} className="flex items-center gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-neon-cyan/10 dark:text-neon-cyan">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                {href ? (
                  <a href={href} className="break-all font-medium text-slate-900 hover:underline dark:text-white">{value}</a>
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        </Reveal>

        <Reveal delay={0.12}>
        <form onSubmit={onSubmit} className="card space-y-4 transition duration-300 hover:shadow-glow">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-slate-600 dark:text-slate-400">{t.form.name}</span>
              <input name="name" required autoComplete="name" className="input" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-slate-600 dark:text-slate-400">{t.form.email}</span>
              <input name="email" type="email" required autoComplete="email" className="input" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-slate-600 dark:text-slate-400">{t.form.message}</span>
            <textarea name="message" required rows={5} className="input resize-y" />
          </label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={status === 'sending'} className="btn btn-primary disabled:opacity-60">
              <Send size={15} /> {status === 'sending' ? t.form.sending : t.form.send}
            </button>
            {status === 'sent' && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">{t.form.sent}</p>}
            {status === 'error' && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{t.form.error}</p>}
          </div>
        </form>
        </Reveal>
      </div>
      <Reveal as="p" y={12} className="mt-16 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {t.name}. {t.footer}
      </Reveal>
    </Section>
  );
}
