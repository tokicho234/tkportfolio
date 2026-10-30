import { NextResponse } from 'next/server';
import { init, saveCv, deleteCv } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 4_000_000; // Vercel rejects request bodies above ~4.5 MB
const fail = (error, status) => NextResponse.json({ error }, { status });

export async function POST(req) {
  try {
    if (!(await isAdmin())) return fail('Not signed in', 401);
    const buf = Buffer.from(await req.arrayBuffer());
    if (buf.length === 0) return fail('Empty file', 400);
    if (buf.length > MAX_BYTES) return fail('PDF is too large (4 MB max)', 413);
    if (buf.toString('ascii', 0, 5) !== '%PDF-') return fail('That file is not a PDF', 415);
    await init();
    return NextResponse.json({ version: await saveCv(buf) });
  } catch (e) {
    console.error('POST /api/admin/cv', e);
    return fail('Could not save the CV', 500);
  }
}

export async function DELETE() {
  try {
    if (!(await isAdmin())) return fail('Not signed in', 401);
    await init();
    await deleteCv();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/cv', e);
    return fail('Could not remove the CV', 500);
  }
}
