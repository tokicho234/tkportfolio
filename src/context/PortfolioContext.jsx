'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_DATA, UI } from '@/lib/data';
import { api } from '@/lib/api';

const Ctx = createContext(null);
const KEYS = { lang: 'tk-lang', theme: 'tk-theme' };
const uid = () => Math.random().toString(36).slice(2, 10);

export function usePortfolio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePortfolio must be used inside <PortfolioProvider>');
  return ctx;
}

export function PortfolioProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [data, setData] = useState(DEFAULT_DATA);
  const [dataReady, setDataReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [saveError, setSaveError] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);
  const dirty = useRef(false);

  // Language and theme are per-visitor preferences, so they stay in localStorage.
  useEffect(() => {
    try {
      const l = localStorage.getItem(KEYS.lang);
      if (l === 'en' || l === 'am') setLang(l);
      const th = localStorage.getItem(KEYS.theme);
      setTheme(th || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    } catch {}
    setPrefsReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    if (prefsReady) try { localStorage.setItem(KEYS.lang, lang); } catch {}
  }, [lang, prefsReady]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (prefsReady) try { localStorage.setItem(KEYS.theme, theme); } catch {}
  }, [theme, prefsReady]);

  // Portfolio content and admin session come from the server (Neon).
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api.getPortfolio(), api.session()]).then(([d, s]) => {
      if (cancelled) return;
      if (d.status === 'fulfilled') setData({ ...DEFAULT_DATA, ...d.value });
      else setLoadFailed(true); // keep showing defaults, but never save them over the database
      if (s.status === 'fulfilled') setIsAdmin(!!s.value.authed);
      setDataReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Debounced autosave while signed in as admin.
  useEffect(() => {
    if (!dirty.current || !isAdmin || loadFailed) return;
    setSaveState('saving');
    const timer = setTimeout(async () => {
      try {
        await api.savePortfolio(data);
        setSaveState('saved');
        setSaveError('');
      } catch (e) {
        if (e.status === 401) setIsAdmin(false);
        setSaveState('error');
        setSaveError(e.status === 401 ? 'Session expired. Unlock again to save your changes.' : e.message);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [data, isAdmin, loadFailed]);

  const login = useCallback(async (passcode) => {
    try {
      await api.login(passcode);
      setIsAdmin(true);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);
  const logout = useCallback(async () => {
    try { await api.logout(); } catch {}
    setIsAdmin(false);
    setSaveState('idle');
  }, []);

  const t = UI[lang];
  // Default content is { en, am }; items added in the admin panel are plain strings.
  const tr = useCallback((v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v), [lang]);
  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'am' : 'en')), []);
  const toggleTheme = useCallback(() => setTheme((x) => (x === 'dark' ? 'light' : 'dark')), []);

  const mutate = useCallback((fn) => {
    dirty.current = true;
    setData(fn);
  }, []);
  const addItem = useCallback((kind, item) => mutate((d) => ({ ...d, [kind]: [...d[kind], { ...item, id: uid() }] })), [mutate]);
  const updateItem = useCallback(
    (kind, id, patch) => mutate((d) => ({ ...d, [kind]: d[kind].map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
    [mutate]
  );
  const removeItem = useCallback((kind, id) => mutate((d) => ({ ...d, [kind]: d[kind].filter((i) => i.id !== id) })), [mutate]);
  const setHeroMode = useCallback((heroMode) => mutate((d) => ({ ...d, heroMode })), [mutate]);
  const setPhoto = useCallback((photo) => mutate((d) => ({ ...d, photo })), [mutate]);
  // Certificate images live in their own table, so keep each cert's image when content is reset or imported.
  const keepImages = (d, certs) => certs.map((c) => ({ ...c, imageVersion: d.certs.find((x) => x.id === c.id)?.imageVersion || 0 }));
  const resetAll = useCallback(() => mutate((d) => ({ ...DEFAULT_DATA, cvVersion: d.cvVersion, certs: keepImages(d, DEFAULT_DATA.certs) })), [mutate]);
  const importData = useCallback(
    (json) => mutate((d) => ({ ...DEFAULT_DATA, ...json, cvVersion: d.cvVersion, certs: keepImages(d, Array.isArray(json.certs) ? json.certs : DEFAULT_DATA.certs) })),
    [mutate]
  );
  // The CV file is saved by its own endpoint, so this updates the screen without triggering a content save.
  const setCvVersion = useCallback((cvVersion) => setData((d) => ({ ...d, cvVersion })), []);
  // Image changes are saved by their own endpoint, so this updates the screen without triggering a content save.
  const setCertImage = useCallback(
    (id, imageVersion) => setData((d) => ({ ...d, certs: d.certs.map((c) => (c.id === id ? { ...c, imageVersion } : c)) })),
    []
  );

  const value = useMemo(
    () => ({
      lang, theme, data, t, tr, dataReady, loadFailed, isAdmin, saveState, saveError, adminOpen,
      setAdminOpen, toggleLang, toggleTheme, login, logout,
      addItem, updateItem, removeItem, setHeroMode, setPhoto, resetAll, importData, setCertImage, setCvVersion,
    }),
    [lang, theme, data, t, tr, dataReady, loadFailed, isAdmin, saveState, saveError, adminOpen, toggleLang, toggleTheme, login, logout, addItem, updateItem, removeItem, setHeroMode, setPhoto, resetAll, importData, setCertImage, setCvVersion]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
