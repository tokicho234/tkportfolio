import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'tk_session';
const TTL = 60 * 60 * 12; // 12 hours

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: TTL,
};

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set to a random string of 32+ characters');
  return s;
}
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

export function createToken() {
  const payload = `admin.${Math.floor(Date.now() / 1000) + TTL}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const given = Buffer.from(token.slice(i + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false;
  const [role, exp] = payload.split('.');
  return role === 'admin' && Number(exp) > Date.now() / 1000;
}

export function passcodeMatches(input) {
  const real = process.env.ADMIN_PASSCODE;
  if (!real) throw new Error('ADMIN_PASSCODE is not set');
  const hash = (v) => crypto.createHash('sha256').update(String(v)).digest();
  return crypto.timingSafeEqual(hash(input), hash(real));
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}
