import { NextResponse } from 'next/server';
import { init, getCertImage } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    if (!/^[\w-]{1,64}$/.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await init();
    const img = await getCertImage(id);
    if (!img) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return new Response(new Uint8Array(img.buffer), {
      headers: {
        'Content-Type': img.mime,
        // The URL carries ?v=<version>, so each upload gets a new URL and old ones can be cached forever.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    console.error('GET /api/cert-image', e);
    return NextResponse.json({ error: 'Could not load image' }, { status: 500 });
  }
}
