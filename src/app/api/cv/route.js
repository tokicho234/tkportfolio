import { NextResponse } from 'next/server';
import { init, getCv } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await init();
    const buf = await getCv();
    if (!buf) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Teketay_Addis_CV.pdf"',
        // The page links to /api/cv?v=<version>, so each upload gets a fresh URL and old ones can be cached.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    console.error('GET /api/cv', e);
    return NextResponse.json({ error: 'Could not load CV' }, { status: 500 });
  }
}
