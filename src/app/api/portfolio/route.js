import { NextResponse } from 'next/server';
import { init, readAll, replaceAll } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { cleanData } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const fail = (error, status = 500) => NextResponse.json({ error }, { status });

export async function GET() {
  try {
    await init();
    return NextResponse.json(await readAll());
  } catch (e) {
    console.error('GET /api/portfolio', e);
    return fail('Could not load portfolio data');
  }
}

export async function PUT(req) {
  try {
    if (!(await isAdmin())) return fail('Not signed in', 401);
    const body = await req.text();
    if (body.length > 1_000_000) return fail('Payload too large', 413);
    let data;
    try {
      data = cleanData(JSON.parse(body));
    } catch {
      return fail('Invalid data', 400);
    }
    await init();
    await replaceAll(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PUT /api/portfolio', e);
    return fail('Could not save portfolio data');
  }
}
