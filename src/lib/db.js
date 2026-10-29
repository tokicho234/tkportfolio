import { neon } from '@neondatabase/serverless';
import { DEFAULT_DATA } from './data';
import { cleanData } from './validate';

let _sql;
export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Creates the tables on first use and seeds them from DEFAULT_DATA exactly once.
let initPromise;
export function init() {
  if (!initPromise) {
    initPromise = doInit().catch((e) => {
      initPromise = null;
      throw e;
    });
  }
  return initPromise;
}

async function doInit() {
  const sql = getSql();
  await sql.transaction([
    sql`CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value jsonb NOT NULL)`,
    sql`CREATE TABLE IF NOT EXISTS skills (
      id text PRIMARY KEY, name text NOT NULL, category text NOT NULL,
      level integer NOT NULL DEFAULT 50, pos integer NOT NULL DEFAULT 0)`,
    sql`CREATE TABLE IF NOT EXISTS projects (
      id text PRIMARY KEY, title jsonb NOT NULL, descr jsonb NOT NULL DEFAULT '""',
      tags text NOT NULL DEFAULT '', pos integer NOT NULL DEFAULT 0)`,
    sql`CREATE TABLE IF NOT EXISTS certs (
      id text PRIMARY KEY, title text NOT NULL, issuer text NOT NULL DEFAULT '',
      issued text NOT NULL DEFAULT '', detail jsonb NOT NULL DEFAULT '""', pos integer NOT NULL DEFAULT 0)`,
    sql`CREATE TABLE IF NOT EXISTS cert_images (
      cert_id text PRIMARY KEY, mime text NOT NULL, data bytea NOT NULL,
      version bigint NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`,
    sql`CREATE TABLE IF NOT EXISTS messages (
      id bigserial PRIMARY KEY, name text NOT NULL, email text NOT NULL, message text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now())`,
    sql`CREATE TABLE IF NOT EXISTS login_attempts (ip text NOT NULL, at timestamptz NOT NULL DEFAULT now())`,
    sql`CREATE INDEX IF NOT EXISTS login_attempts_at ON login_attempts (at)`,
  ]);
  const seeded = await sql`SELECT 1 FROM settings WHERE key = 'seeded'`;
  if (seeded.length === 0) {
    await replaceAll(cleanData(DEFAULT_DATA));
    await sql`INSERT INTO settings (key, value) VALUES ('seeded', 'true'::jsonb) ON CONFLICT (key) DO NOTHING`;
  }
}

export async function readAll() {
  const sql = getSql();
  const [skills, projects, certs, settings] = await sql.transaction([
    sql`SELECT id, name, category, level FROM skills ORDER BY pos`,
    sql`SELECT id, title, descr, tags FROM projects ORDER BY pos`,
    sql`SELECT c.id, c.title, c.issuer, c.issued, c.detail, i.version::text AS img
        FROM certs c LEFT JOIN cert_images i ON i.cert_id = c.id ORDER BY c.pos`,
    sql`SELECT key, value FROM settings WHERE key IN ('heroMode', 'photo')`,
  ]);
  const s = Object.fromEntries(settings.map((r) => [r.key, r.value]));
  return {
    heroMode: s.heroMode === 'photo' ? 'photo' : '3d',
    photo: typeof s.photo === 'string' ? s.photo : '',
    skills,
    projects: projects.map((p) => ({ id: p.id, title: p.title, desc: p.descr, tags: p.tags })),
    certs: certs.map((c) => ({
      id: c.id, title: c.title, issuer: c.issuer, date: c.issued, detail: c.detail,
      imageVersion: c.img ? Number(c.img) : 0,
    })),
  };
}

// Replaces every collection atomically. `d` must already be sanitized (see validate.js).
export async function replaceAll(d) {
  const sql = getSql();
  const j = (v) => JSON.stringify(v);
  await sql.transaction([
    sql`DELETE FROM skills`,
    sql`INSERT INTO skills (id, name, category, level, pos)
        SELECT r.id, r.name, r.category, r.level, (e.ord - 1)::int
        FROM jsonb_array_elements(${j(d.skills)}::jsonb) WITH ORDINALITY AS e(obj, ord),
             jsonb_to_record(e.obj) AS r(id text, name text, category text, level int)`,
    sql`DELETE FROM projects`,
    sql`INSERT INTO projects (id, title, descr, tags, pos)
        SELECT r.id, r.title, r.descr, r.tags, (e.ord - 1)::int
        FROM jsonb_array_elements(${j(d.projects)}::jsonb) WITH ORDINALITY AS e(obj, ord),
             jsonb_to_record(e.obj) AS r(id text, title jsonb, descr jsonb, tags text)`,
    sql`DELETE FROM certs`,
    sql`INSERT INTO certs (id, title, issuer, issued, detail, pos)
        SELECT r.id, r.title, r.issuer, r.issued, r.detail, (e.ord - 1)::int
        FROM jsonb_array_elements(${j(d.certs)}::jsonb) WITH ORDINALITY AS e(obj, ord),
             jsonb_to_record(e.obj) AS r(id text, title text, issuer text, issued text, detail jsonb)`,
    sql`INSERT INTO settings (key, value) VALUES ('heroMode', ${j(d.heroMode)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    sql`INSERT INTO settings (key, value) VALUES ('photo', ${j(d.photo)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    // Remove images of deleted certificates. The 10 minute grace avoids racing an upload for a cert that is still being saved.
    sql`DELETE FROM cert_images WHERE cert_id NOT IN (SELECT id FROM certs) AND updated_at < now() - interval '10 minutes'`,
  ]);
}

export async function getCertImage(id) {
  const rows = await getSql()`SELECT mime, encode(data, 'base64') AS b64 FROM cert_images WHERE cert_id = ${id}`;
  return rows[0] ? { mime: rows[0].mime, buffer: Buffer.from(rows[0].b64, 'base64') } : null;
}

export async function saveCertImage(id, mime, buffer) {
  const rows = await getSql()`
    INSERT INTO cert_images (cert_id, mime, data, version, updated_at)
    VALUES (${id}, ${mime}, decode(${buffer.toString('base64')}, 'base64'), (extract(epoch from now()) * 1000)::bigint, now())
    ON CONFLICT (cert_id) DO UPDATE
      SET mime = EXCLUDED.mime, data = EXCLUDED.data, version = EXCLUDED.version, updated_at = now()
    RETURNING version::text AS version`;
  return Number(rows[0].version);
}

export async function deleteCertImage(id) {
  await getSql()`DELETE FROM cert_images WHERE cert_id = ${id}`;
}
