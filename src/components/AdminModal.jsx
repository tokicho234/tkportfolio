'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, ImageIcon, Lock, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import { api } from '@/lib/api';
import { usePortfolio } from '@/context/PortfolioContext';

const TABS = ['skills', 'projects', 'certs', 'cv', 'messages', 'display'];
const TAB_LABEL = { skills: 'Skills', projects: 'Projects', certs: 'Certificates', cv: 'CV', messages: 'Messages', display: 'Display' };

const field = 'input';
const iconBtn = 'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10';

function Label({ children, className = '' }) {
  return <label className={`block text-xs text-slate-500 dark:text-slate-400 ${className}`}>{children}</label>;
}

// Default content is stored per language ({en, am}); keep the other language when editing one.
function patchText(item, key, value, lang) {
  const cur = item[key];
  return { [key]: cur && typeof cur === 'object' ? { ...cur, [lang]: value } : value };
}

function Skills() {
  const { data, addItem, updateItem, removeItem, t } = usePortfolio();
  const [draft, setDraft] = useState({ name: '', category: 'software', level: 70 });

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10 sm:grid-cols-[1fr_auto_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.name.trim()) return;
          addItem('skills', { ...draft, name: draft.name.trim() });
          setDraft({ ...draft, name: '' });
        }}
      >
        <Label>
          Skill
          <input className={field} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Terraform" />
        </Label>
        <Label>
          Category
          <select className={field} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{t.cat[c]}</option>)}
          </select>
        </Label>
        <Label>
          Level {draft.level}%
          <input type="range" min="10" max="100" step="5" className="mt-3 block w-full" value={draft.level} onChange={(e) => setDraft({ ...draft, level: +e.target.value })} />
        </Label>
        <button className="btn btn-primary self-end"><Plus size={15} /> Add</button>
      </form>

      {CATEGORIES.map((c) => (
        <div key={c}>
          <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{t.cat[c]}</h4>
          <ul className="space-y-2">
            {data.skills.filter((s) => s.category === c).map((s) => (
              <li key={s.id} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_9rem_5rem_auto]">
                <input aria-label="Skill name" className={field} value={s.name} onChange={(e) => updateItem('skills', s.id, { name: e.target.value })} />
                <select aria-label="Category" className={`${field} hidden sm:block`} value={s.category} onChange={(e) => updateItem('skills', s.id, { category: e.target.value })}>
                  {CATEGORIES.map((x) => <option key={x} value={x}>{t.cat[x].split(' ')[0]}</option>)}
                </select>
                <input aria-label="Level" type="number" min="0" max="100" className={`${field} hidden sm:block`} value={s.level} onChange={(e) => updateItem('skills', s.id, { level: Math.max(0, Math.min(100, +e.target.value || 0)) })} />
                <button aria-label={`Delete ${s.name}`} className={iconBtn} onClick={() => removeItem('skills', s.id)}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Projects() {
  const { data, addItem, updateItem, removeItem, tr, lang } = usePortfolio();
  const [d, setD] = useState({ title: '', desc: '', tags: '' });

  return (
    <div className="space-y-6">
      <form
        className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10"
        onSubmit={(e) => {
          e.preventDefault();
          if (!d.title.trim()) return;
          addItem('projects', d);
          setD({ title: '', desc: '', tags: '' });
        }}
      >
        <Label>Title<input className={field} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Label>
        <Label>Description<textarea rows={3} className={field} value={d.desc} onChange={(e) => setD({ ...d, desc: e.target.value })} /></Label>
        <Label>Tags (comma separated)<input className={field} value={d.tags} onChange={(e) => setD({ ...d, tags: e.target.value })} /></Label>
        <button className="btn btn-primary"><Plus size={15} /> Add project</button>
      </form>

      <ul className="space-y-4">
        {data.projects.map((p) => (
          <li key={p.id} className="space-y-2 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <div className="flex gap-2">
              <input aria-label="Title" className={field} value={tr(p.title)} onChange={(e) => updateItem('projects', p.id, patchText(p, 'title', e.target.value, lang))} />
              <button aria-label={`Delete ${tr(p.title)}`} className={iconBtn} onClick={() => removeItem('projects', p.id)}><Trash2 size={16} /></button>
            </div>
            <textarea aria-label="Description" rows={3} className={field} value={tr(p.desc)} onChange={(e) => updateItem('projects', p.id, patchText(p, 'desc', e.target.value, lang))} />
            <input aria-label="Tags" className={field} value={p.tags} onChange={(e) => updateItem('projects', p.id, { tags: e.target.value })} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function resizeToBlob(file, max = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; // JPEG has no transparency
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a readable image')); };
    img.src = url;
  });
}

function CertImageControl({ cert }) {
  const { setCertImage } = usePortfolio();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const blob = await resizeToBlob(file);
      const { version } = await api.uploadCertImage(cert.id, blob);
      setCertImage(cert.id, version);
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setBusy(false);
  }

  async function onRemove() {
    setBusy(true);
    setError('');
    try {
      await api.deleteCertImage(cert.id);
      setCertImage(cert.id, 0);
    } catch (err) {
      setError(err.message || 'Could not remove image');
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 pt-1">
      {cert.imageVersion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/cert-image/${cert.id}?v=${cert.imageVersion}`} alt={`${cert.title} certificate`} className="h-16 w-24 rounded-lg border border-slate-200 object-cover dark:border-white/10" />
      ) : (
        <div className="grid h-16 w-24 place-items-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-white/15"><ImageIcon size={20} /></div>
      )}
      <label className={`btn btn-ghost cursor-pointer !py-1.5 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        <Upload size={14} /> {busy ? 'Working...' : cert.imageVersion ? 'Replace image' : 'Upload image'}
        <input type="file" accept="image/*" className="sr-only" onChange={onFile} disabled={busy} />
      </label>
      {cert.imageVersion ? <button className="btn btn-ghost !py-1.5" onClick={onRemove} disabled={busy}>Remove image</button> : null}
      {error && <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function Certs() {
  const { data, addItem, updateItem, removeItem, tr, lang } = usePortfolio();
  const [d, setD] = useState({ title: '', issuer: '', date: '', detail: '' });

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!d.title.trim()) return;
          addItem('certs', d);
          setD({ title: '', issuer: '', date: '', detail: '' });
        }}
      >
        <Label className="sm:col-span-2">Title<input className={field} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Label>
        <Label>Issuer<input className={field} value={d.issuer} onChange={(e) => setD({ ...d, issuer: e.target.value })} /></Label>
        <Label>Date<input className={field} value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} placeholder="June 2025" /></Label>
        <Label className="sm:col-span-2">Details (optional)<textarea rows={2} className={field} value={d.detail} onChange={(e) => setD({ ...d, detail: e.target.value })} /></Label>
        <button className="btn btn-primary sm:col-span-2 sm:justify-self-start"><Plus size={15} /> Add certificate</button>
        <p className="text-xs text-slate-500 sm:col-span-2">After adding, upload its image from the certificate's row below.</p>
      </form>

      <ul className="space-y-4">
        {data.certs.map((c) => (
          <li key={c.id} className="space-y-2 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <div className="flex gap-2">
              <input aria-label="Title" className={field} value={c.title} onChange={(e) => updateItem('certs', c.id, { title: e.target.value })} />
              <button aria-label={`Delete ${c.title}`} className={iconBtn} onClick={() => removeItem('certs', c.id)}><Trash2 size={16} /></button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input aria-label="Issuer" className={field} value={c.issuer} onChange={(e) => updateItem('certs', c.id, { issuer: e.target.value })} />
              <input aria-label="Date" className={field} value={c.date} onChange={(e) => updateItem('certs', c.id, { date: e.target.value })} />
            </div>
            <textarea aria-label="Details" rows={2} className={field} value={tr(c.detail) || ''} onChange={(e) => updateItem('certs', c.id, patchText(c, 'detail', e.target.value, lang))} />
            <CertImageControl cert={c} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Messages() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.messages().then((r) => setItems(r.messages)).catch((e) => setError(e.message));
  }, []);

  async function remove(id) {
    try {
      await api.deleteMessage(id);
      setItems((list) => list.filter((m) => m.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  if (!items) return <p className="text-sm text-slate-500">Loading...</p>;
  if (items.length === 0) return <p className="text-sm text-slate-500">No messages yet. Messages from the contact form appear here.</p>;

  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
              <a href={`mailto:${m.email}`} className="break-all text-sm text-sky-700 hover:underline dark:text-neon-cyan">{m.email}</a>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <time className="text-xs text-slate-500" dateTime={m.created_at}>{new Date(m.created_at).toLocaleString()}</time>
              <button aria-label={`Delete message from ${m.name}`} className={iconBtn} onClick={() => remove(m.id)}><Trash2 size={16} /></button>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{m.message}</p>
        </li>
      ))}
    </ul>
  );
}

function resizeToDataUrl(file, max = 640) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function Display() {
  const { data, setHeroMode, setPhoto, resetAll, importData } = usePortfolio();
  const [msg, setMsg] = useState('');

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await resizeToDataUrl(file));
      setMsg('Photo saved. Switch the hero to Photo to show it.');
    } catch {
      setMsg('That file could not be read as an image.');
    }
    e.target.value = '';
  }

  function onExport() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      importData(JSON.parse(await file.text()));
      setMsg('Data imported.');
    } catch {
      setMsg('That file is not valid portfolio JSON.');
    }
    e.target.value = '';
  }

  return (
    <div className="space-y-8">
      <section>
        <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Hero visual</h4>
        <div className="flex gap-2">
          {[['3d', '3D network animation'], ['photo', 'Profile photo']].map(([k, label]) => (
            <button key={k} onClick={() => setHeroMode(k)} aria-pressed={data.heroMode === k} className={`btn ${data.heroMode === k ? 'btn-primary' : 'btn-ghost'}`}>{label}</button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Profile photo</h4>
        <div className="flex flex-wrap items-center gap-3">
          {data.photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={data.photo} alt="Current profile" className="h-16 w-16 rounded-xl object-cover" />}
          <label className="btn btn-ghost cursor-pointer"><Upload size={15} /> Upload photo<input type="file" accept="image/*" className="sr-only" onChange={onPhoto} /></label>
          {data.photo && <button className="btn btn-ghost" onClick={() => setPhoto('')}>Remove</button>}
        </div>
      </section>

      <section>
        <h4 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">Backup</h4>
        <p className="mb-3 text-sm text-slate-500">Changes save to the database automatically. Export a JSON backup if you want a copy.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={onExport}><Download size={15} /> Export JSON</button>
          <label className="btn btn-ghost cursor-pointer"><Upload size={15} /> Import JSON<input type="file" accept="application/json" className="sr-only" onChange={onImport} /></label>
          <button className="btn btn-ghost text-red-600 dark:text-red-400" onClick={() => window.confirm('Reset all content to the defaults?') && resetAll()}><RotateCcw size={15} /> Reset to defaults</button>
        </div>
      </section>
      {msg && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">{msg}</p>}
    </div>
  );
}

function Cv() {
  const { data, setCvVersion } = usePortfolio();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const href = data.cvVersion ? `/api/cv?v=${data.cvVersion}` : '/Teketay_Addis_CV.pdf';

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMsg('');
    setError('');
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return setError('Please choose a PDF file.');
    if (file.size > 4 * 1024 * 1024) return setError('That PDF is larger than 4 MB. Compress it and try again.');
    setBusy(true);
    try {
      const { version } = await api.uploadCv(file);
      setCvVersion(version);
      setMsg('CV uploaded. The Download CV button now serves this file.');
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setBusy(false);
  }

  async function onRemove() {
    if (!window.confirm('Remove the uploaded CV and go back to the default file?')) return;
    setMsg('');
    setError('');
    setBusy(true);
    try {
      await api.deleteCv();
      setCvVersion(0);
      setMsg('Uploaded CV removed. The default file is used again.');
    } catch (err) {
      setError(err.message || 'Could not remove the CV');
    }
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {data.cvVersion ? 'Using your uploaded CV' : 'Using the default CV file'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {data.cvVersion ? `Uploaded ${new Date(data.cvVersion).toLocaleString()}.` : 'Upload a PDF to replace it. No redeploy needed.'}
        </p>
        <a href={href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-sky-700 hover:underline dark:text-neon-cyan">
          Open current CV
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        <label className={`btn btn-primary cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          <Upload size={15} /> {busy ? 'Working...' : data.cvVersion ? 'Replace CV' : 'Upload CV'}
          <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={onFile} disabled={busy} />
        </label>
        {data.cvVersion ? <button className="btn btn-ghost" onClick={onRemove} disabled={busy}>Remove uploaded CV</button> : null}
      </div>
      <p className="text-xs text-slate-500">PDF only, up to 4 MB.</p>
      {msg && <p role="status" className="text-sm text-slate-600 dark:text-slate-400">{msg}</p>}
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function SaveStatus() {
  const { saveState, saveError, loadFailed } = usePortfolio();
  if (loadFailed) return <span className="text-xs text-red-600 dark:text-red-400">Could not load from database. Saving is disabled.</span>;
  const map = { saving: 'Saving...', saved: 'Saved', error: saveError || 'Save failed', idle: '' };
  return (
    <span role="status" className={`text-xs ${saveState === 'error' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
      {map[saveState]}
    </span>
  );
}

export default function AdminModal() {
  const { adminOpen, setAdminOpen, isAdmin, login, logout } = usePortfolio();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('skills');
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!adminOpen) return;
    const onKey = (e) => e.key === 'Escape' && setAdminOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [adminOpen, setAdminOpen]);

  async function onLogin(e) {
    e.preventDefault();
    setBusy(true);
    const r = await login(code);
    setBusy(false);
    if (r.ok) { setCode(''); setError(''); } else setError(r.error);
  }

  return (
    <AnimatePresence>
      {adminOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setAdminOpen(false)}
        >
          <motion.div
            ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Admin Portal"
            initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.98 }}
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl outline-none dark:border-white/10 dark:bg-obsidian-900 dark:text-slate-300"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-white/10">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Portal</h2>
                {isAdmin && <SaveStatus />}
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && <button onClick={logout} className="btn btn-ghost !py-1.5">Sign out</button>}
                <button onClick={() => setAdminOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10"><X size={18} /></button>
              </div>
            </div>

            {!isAdmin ? (
              <form onSubmit={onLogin} className="space-y-4 p-6">
                <p className="text-sm text-slate-600 dark:text-slate-400">Enter the admin passcode to edit the portfolio.</p>
                <input type="password" autoFocus autoComplete="current-password" aria-label="Passcode" className={field} value={code} onChange={(e) => setCode(e.target.value)} />
                {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <button disabled={busy || !code} className="btn btn-primary disabled:opacity-60"><Lock size={15} /> {busy ? 'Checking...' : 'Unlock'}</button>
              </form>
            ) : (
              <>
                <div role="tablist" className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-2 dark:border-white/10">
                  {TABS.map((k) => (
                    <button
                      key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                      className={`-mb-px shrink-0 whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium ${tab === k ? 'border-sky-600 text-slate-900 dark:border-neon-cyan dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                      {TAB_LABEL[k]}
                    </button>
                  ))}
                </div>
                <div className="overflow-y-auto p-6">
                  {tab === 'skills' && <Skills />}
                  {tab === 'projects' && <Projects />}
                  {tab === 'certs' && <Certs />}
                  {tab === 'cv' && <Cv />}
                  {tab === 'messages' && <Messages />}
                  {tab === 'display' && <Display />}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
