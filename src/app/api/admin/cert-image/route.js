import { NextResponse } from 'next/server';
import { init, saveCertImage, deleteCertImage } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 3_000_000;
const fail = (error, status) => NextResponse.json({ error }, { status });
const certId = (req) => {
  const id = new URL(req.url).searchParams.get('id');
  return id && /^[\w-]{1,64}$/.test(id) ? id : null;
};

function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return 'image/png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(req) {
  try {
    if (!(await isAdmin())) return fail('Not signed in', 401);
    const id = certId(req);
    if (!id) return fail('Invalid certificate id', 400);

    const buf = Buffer.from(await req.arrayBuffer());
    if (buf.length === 0) return fail('Empty file', 400);
    if (buf.length > MAX_BYTES) return fail('Image is too large (3 MB max)', 413);
    const mime = sniff(buf); // trust the file's bytes, not the header
    if (!mime) return fail('Only JPEG, PNG or WebP images are allowed', 415);

    await init();
    return NextResponse.json({ version: await saveCertImage(id, mime, buf) });
  } catch (e) {
    console.error('POST /api/admin/cert-image', e);
    return fail('Could not save image', 500);
  }
}

export async function DELETE(req) {
  try {
    if (!(await isAdmin())) return fail('Not signed in', 401);
    const id = certId(req);
    if (!id) return fail('Invalid certificate id', 400);
    await init();
    await deleteCertImage(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/cert-image', e);
    return fail('Could not remove image', 500);
  }
}
