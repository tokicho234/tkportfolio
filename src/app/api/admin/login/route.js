import { NextResponse } from 'next/server';
import { init, getSql } from '@/lib/db';
import { COOKIE, cookieOptions, createToken, isAdmin, passcodeMatches } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 8; // per IP per 15 minutes

export async function GET() {
  try {
    return NextResponse.json({ authed: await isAdmin() });
  } catch {
    return NextResponse.json({ authed: false });
  }
}

export async function POST(req) {
  try {
    const { passcode } = await req.json().catch(() => ({}));
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    await init();
    const sql = getSql();

    const [{ n }] = await sql`SELECT count(*)::int AS n FROM login_attempts WHERE ip = ${ip} AND at > now() - interval '15 minutes'`;
    if (n >= MAX_ATTEMPTS) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });

    if (typeof passcode !== 'string' || !passcodeMatches(passcode)) {
      await sql`INSERT INTO login_attempts (ip) VALUES (${ip})`;
      await sql`DELETE FROM login_attempts WHERE at < now() - interval '1 day'`;
      return NextResponse.json({ error: 'Wrong passcode' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, createToken(), cookieOptions);
    return res;
  } catch (e) {
    console.error('POST /api/admin/login', e);
    return NextResponse.json({ error: 'Login is unavailable. Check the server configuration.' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return res;
}
