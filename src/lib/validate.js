import { randomUUID } from 'node:crypto';

const CATEGORIES = ['software', 'cloud', 'network', 'support'];
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
// Content is either a plain string or a per-language { en, am } object.
const text = (v, max) =>
  v && typeof v === 'object' && !Array.isArray(v) ? { en: str(v.en, max), am: str(v.am, max) } : str(v, max);

function uniqueIds(items, map) {
  const seen = new Set();
  return items.map((raw) => {
    const item = map(raw && typeof raw === 'object' ? raw : {});
    let id = typeof raw?.id === 'string' && /^[\w-]{1,64}$/.test(raw.id) ? raw.id : null;
    if (!id || seen.has(id)) id = randomUUID().slice(0, 8);
    seen.add(id);
    return { id, ...item };
  });
}

export function cleanData(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid body');
  const list = (a, n) => (Array.isArray(a) ? a.slice(0, n) : []);
  const photo =
    typeof raw.photo === 'string' && raw.photo.startsWith('data:image/') && raw.photo.length <= 500_000 ? raw.photo : '';

  return {
    heroMode: raw.heroMode === 'photo' ? 'photo' : '3d',
    photo,
    skills: uniqueIds(list(raw.skills, 300), (s) => ({
      name: str(s.name, 120),
      category: CATEGORIES.includes(s.category) ? s.category : 'software',
      level: Math.max(0, Math.min(100, Math.round(Number(s.level) || 0))),
    })),
    projects: uniqueIds(list(raw.projects, 100), (p) => ({
      title: text(p.title, 200),
      descr: text(p.desc, 2000),
      tags: str(p.tags, 300),
    })),
    certs: uniqueIds(list(raw.certs, 100), (c) => ({
      title: str(c.title, 200),
      issuer: str(c.issuer, 200),
      issued: str(c.date, 60),
      detail: text(c.detail, 1000),
    })),
  };
}
