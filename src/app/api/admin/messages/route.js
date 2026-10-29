import { NextResponse } from 'next/server';
import { init, getSql } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (error, status) => NextResponse.json({ error }, { status });

export async function GET() {
  try {
    if (!(await isAdmin())) return fail('Not signed in', 401);
    await init();
    const rows = await getSql()`SELECT id::text, name, email, message, created_at FROM messages ORDER BY created_at DESC LIMIT 200`;
    return NextResponse.json({ messages: rows });
  } catch (e) {
    console.error('GET /api/admin/messages', e);
    return fail('Could not load messages', 500);
  }
}

export async function DELETE(req) {
  try {
    if (!(await isAdmin())) return fail('Not signed in', 401);
    const id = new URL(req.url).searchParams.get('id');
    if (!id || !/^\d+$/.test(id)) return fail('Invalid id', 400);
    await init();
    await getSql()`DELETE FROM messages WHERE id = ${id}::bigint`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/messages', e);
    return fail('Could not delete message', 500);
  }
}
