import { NextResponse } from 'next/server';
import { init, getSql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (error, status) => NextResponse.json({ error }, { status });

export async function POST(req) {
  try {
    const b = await req.json().catch(() => null);
    if (!b || typeof b !== 'object') return fail('Invalid request', 400);

    // Honeypot: real visitors never fill this hidden field. Pretend success to bots.
    if (b.website) return NextResponse.json({ ok: true });

    const name = String(b.name ?? '').trim().slice(0, 120);
    const email = String(b.email ?? '').trim().slice(0, 200);
    const message = String(b.message ?? '').trim().slice(0, 5000);
    if (!name || !message || !EMAIL_RE.test(email)) return fail('Please fill in your name, a valid email and a message.', 400);

    await init();
    const sql = getSql();
    const [{ per_email, total }] = await sql`
      SELECT count(*) FILTER (WHERE lower(email) = lower(${email}))::int AS per_email, count(*)::int AS total
      FROM messages WHERE created_at > now() - interval '1 hour'`;
    if (per_email >= 5 || total >= 60) return fail('Too many messages right now. Please try again later.', 429);

    await sql`INSERT INTO messages (name, email, message) VALUES (${name}, ${email}, ${message})`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/contact', e);
    return fail('Could not send your message.', 500);
  }
}
